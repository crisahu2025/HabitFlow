/**
 * HabitFlow - Sistema de Autenticación, Usuarios y Perfil
 * Code Ahumada
 */

class AuthManager {
  constructor() {
    this.USERS_KEY = 'habitflow_users_db';
    this.CURRENT_USER_KEY = 'habitflow_session_user';
    this.currentUser = null;
    this.init();
  }

  init() {
    this.loadSession();
  }

  // Genera un hash SHA-256 seguro para contraseñas
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getUsers() {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error al cargar usuarios:', e);
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  loadSession() {
    try {
      const session = localStorage.getItem(this.CURRENT_USER_KEY);
      if (session) {
        this.currentUser = JSON.parse(session);
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  saveSession(user) {
    this.currentUser = user;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  clearSession() {
    this.currentUser = null;
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async register({ name, username, email, password, weightKg }) {
    const users = this.getUsers();
    const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Validar duplicados
    const exists = users.find(u => u.username === cleanUsername || (cleanEmail && u.email === cleanEmail));
    if (exists) {
      throw new Error('Ya existe una cuenta con ese nombre de usuario o correo.');
    }

    const passwordHash = await this.hashPassword(password);
    const weight = Number(weightKg) || 70;
    const recommendedWaterMl = Math.round((weight / 7) * 250);

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: name.trim() || cleanUsername,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: passwordHash,
      weightKg: weight,
      recommendedWaterMl: recommendedWaterMl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    this.saveSession(newUser);

    // Actualizar meta diaria inicial con la fórmula de Frank
    if (window.storageManager) {
      window.storageManager.setDailyGoal(recommendedWaterMl);
    }

    return newUser;
  }

  async login(identifier, password) {
    const users = this.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const passwordHash = await this.hashPassword(password);

    const user = users.find(u => 
      (u.username === cleanId || u.email === cleanId) && u.passwordHash === passwordHash
    );

    if (!user) {
      throw new Error('Credenciales incorrectas. Verificá tu usuario y contraseña.');
    }

    this.saveSession(user);

    // Cargar meta del usuario
    if (window.storageManager && user.recommendedWaterMl) {
      window.storageManager.setDailyGoal(user.recommendedWaterMl);
    }

    return user;
  }

  async updateProfile({ name, weightKg, dailyGoalMl }) {
    if (!this.currentUser) throw new Error('No hay sesión activa.');

    const users = this.getUsers();
    const index = users.findIndex(u => u.id === this.currentUser.id);
    if (index === -1) throw new Error('Usuario no encontrado.');

    if (name) this.currentUser.name = name.trim();
    if (weightKg) {
      const weight = Number(weightKg);
      this.currentUser.weightKg = weight;
      this.currentUser.recommendedWaterMl = Math.round((weight / 7) * 250);
    }
    if (dailyGoalMl) {
      this.currentUser.recommendedWaterMl = Number(dailyGoalMl);
    }
    this.currentUser.updatedAt = new Date().toISOString();

    users[index] = this.currentUser;
    this.saveUsers(users);
    this.saveSession(this.currentUser);

    if (window.storageManager && this.currentUser.recommendedWaterMl) {
      window.storageManager.setDailyGoal(this.currentUser.recommendedWaterMl);
    }

    return this.currentUser;
  }

  logout() {
    this.clearSession();
    window.location.reload();
  }
}

window.authManager = new AuthManager();

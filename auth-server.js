const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = 'tu-clave-secreta-super-segura-123';
const EXPIRES_IN = '1h';

server.use(jsonServer.bodyParser);
server.use(middlewares);

// Crear token JWT
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
}

// Verificar token JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}

// Middleware para verificar autenticación
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.user = decoded;
  next();
}

// Middleware para verificar si es Admin
function isAdmin(req, res, next) {
  const db = router.db;
  const user = db.get('users').find({ id: req.user.id }).value();

  if (!user || user.role !== 'Admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }

  next();
}

// ==================== AUTENTICACIÓN ====================

// REGISTRO
server.post('/register', async (req, res) => {
  const { email, name, password, role, ...otherData } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Nombre y password son requeridos' });
  }

  const db = router.db;
  const existingUser = db.get('users').find({ name }).value();

  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: String(Date.now()),
    name,
    email: email || '',
    password: hashedPassword,
    role: role || 'User',
    ...otherData,
    createdAt: new Date().toISOString()
  };

  db.get('users').push(newUser).write();

  const token = createToken({ id: newUser.id, name: newUser.name });
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    accessToken: token,
    user: userWithoutPassword
  });
});

// LOGIN
server.post('/login', async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Nombre y password son requeridos' });
  }

  const db = router.db;
  const user = db.get('users').find({ name }).value();

  if (!user) {
    return res.status(400).json({ error: 'Nombre o password incorrectos' });
  }

  let isValidPassword = false;

  if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
    isValidPassword = await bcrypt.compare(password, user.password);
  } else {
    isValidPassword = password === user.password;
  }

  if (!isValidPassword) {
    return res.status(400).json({ error: 'Nombre o password incorrectos' });
  }

  const token = createToken({ id: user.id, name: user.name });
  const { password: _, ...userWithoutPassword } = user;

  res.status(200).json({
    accessToken: token,
    user: userWithoutPassword
  });
});

// OBTENER USUARIO ACTUAL
server.get('/auth/me', isAuthenticated, (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.user.id }).value();

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

// ==================== CRUD USERS ====================

// OBTENER TODOS LOS USUARIOS (solo Admin)
server.get('/users', isAuthenticated, isAdmin, (req, res) => {
  const db = router.db;
  const users = db.get('users').value().map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.status(200).json(users);
});

// OBTENER UN USUARIO POR ID
server.get('/users/:id', isAuthenticated, (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.id }).value();

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password, ...userWithoutPassword } = user;
  res.status(200).json(userWithoutPassword);
});

// CREAR USUARIO (solo Admin)
server.post('/users', isAuthenticated, isAdmin, async (req, res) => {
  const { name, password, email, role, ...otherData } = req.body;

  if (!name || !password) {
    return res.status(400).json({ error: 'Nombre y password son requeridos' });
  }

  const db = router.db;
  const existingUser = db.get('users').find({ name }).value();

  if (existingUser) {
    return res.status(400).json({ error: 'El usuario ya existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: String(Date.now()),
    name,
    email: email || '',
    password: hashedPassword,
    role: role || 'User',
    ...otherData,
    createdAt: new Date().toISOString()
  };

  db.get('users').push(newUser).write();

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json(userWithoutPassword);
});

// ACTUALIZAR USUARIO (solo Admin)
server.put('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.id }).value();

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password, ...updateData } = req.body;
  
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const updatedUser = {
    ...user,
    ...updateData,
    ...(hashedPassword && { password: hashedPassword }),
    updatedAt: new Date().toISOString()
  };

  db.get('users')
    .find({ id: req.params.id })
    .assign(updatedUser)
    .write();

  const { password: _, ...userWithoutPassword } = updatedUser;
  res.status(200).json(userWithoutPassword);
});

// ACTUALIZAR PARCIALMENTE USUARIO (solo Admin)
server.patch('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.id }).value();

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { password, ...updateData } = req.body;
  
  let hashedPassword;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const updatedFields = {
    ...updateData,
    ...(hashedPassword && { password: hashedPassword }),
    updatedAt: new Date().toISOString()
  };

  db.get('users')
    .find({ id: req.params.id })
    .assign(updatedFields)
    .write();

  const updatedUser = db.get('users').find({ id: req.params.id }).value();
  const { password: _, ...userWithoutPassword } = updatedUser;
  res.status(200).json(userWithoutPassword);
});

// ELIMINAR USUARIO (solo Admin)
server.delete('/users/:id', isAuthenticated, isAdmin, (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.params.id }).value();

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  // No permitir que el admin se elimine a sí mismo
  if (user.id === req.user.id) {
    return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
  }

  db.get('users').remove({ id: req.params.id }).write();

  res.status(200).json({ message: 'Usuario eliminado correctamente' });
});

// ==================== CRUD TASKS ====================

// OBTENER TODAS LAS TAREAS
server.get('/tasks', isAuthenticated, (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.user.id }).value();

  let tasks;
  if (user.role === 'Admin') {
    // Admin ve todas las tareas
    tasks = db.get('tasks').value();
  } else {
    // Usuario normal solo ve sus tareas
    tasks = db.get('tasks').filter({ userId: req.user.id }).value();
  }

  res.status(200).json(tasks);
});

// OBTENER TAREAS POR USERID
server.get('/tasks/user/:userId', isAuthenticated, (req, res) => {
  const db = router.db;
  const user = db.get('users').find({ id: req.user.id }).value();
  
  // Verificar que el usuario esté consultando sus propias tareas o sea Admin
  if (user.role !== 'Admin' && req.params.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para ver estas tareas' });
  }

  const tasks = db.get('tasks').filter({ userId: req.params.userId }).value();
  res.status(200).json(tasks);
});

// OBTENER UNA TAREA POR ID
server.get('/tasks/:id', isAuthenticated, (req, res) => {
  const db = router.db;
  const task = db.get('tasks').find({ id: req.params.id }).value();

  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const user = db.get('users').find({ id: req.user.id }).value();

  // Verificar que el usuario tenga acceso a esta tarea
  if (user.role !== 'Admin' && task.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para ver esta tarea' });
  }

  res.status(200).json(task);
});

// CREAR TAREA
server.post('/tasks', isAuthenticated, (req, res) => {
  const { name, description, status, priority, userId, ...otherData } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El título es requerido' });
  }

  const db = router.db;

  const newTask = {
    id: String(Date.now()),
    name,
    description: description || '',
    status: status || 'pendiente',
    priority: priority || 'medium',
    userId: userId || req.user.id,
    ...otherData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.get('tasks').push(newTask).write();

  res.status(201).json(newTask);
});

// ✅ ACTUALIZAR TAREA COMPLETA - VERSIÓN CORRECTA
server.put('/tasks/:id', isAuthenticated, (req, res) => {
  const db = router.db;
  const task = db.get('tasks').find({ id: req.params.id }).value();

  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const user = db.get('users').find({ id: req.user.id }).value();

  // Verificar permisos
  if (user.role !== 'Admin' && task.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para modificar esta tarea' });
  }

  // ✅ Solo excluye createdAt, NO userId
  const { createdAt, ...updateData } = req.body;

  const updatedTask = {
    ...task,
    ...updateData, // ✅ Esto incluirá userId del body
    createdAt: task.createdAt,
    updatedAt: new Date().toISOString()
  };

  console.log('📝 Actualizando tarea:', {
    id: req.params.id,
    oldUserId: task.userId,
    newUserId: updateData.userId,
    isAdmin: user.role === 'Admin'
  });

  db.get('tasks')
    .find({ id: req.params.id })
    .assign(updatedTask)
    .write();

  res.status(200).json(updatedTask);
});

// ELIMINAR TAREA
server.delete('/tasks/:id', isAuthenticated, (req, res) => {
  const db = router.db;
  const task = db.get('tasks').find({ id: req.params.id }).value();

  if (!task) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  const user = db.get('users').find({ id: req.user.id }).value();

  // Verificar permisos
  if (user.role !== 'Admin' && task.userId !== req.user.id) {
    return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
  }

  db.get('tasks').remove({ id: req.params.id }).write();

  res.status(200).json({ message: 'Tarea eliminada correctamente' });
});

// Usar el router de json-server para otras rutas
server.use(router);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 JSON Server con autenticación corriendo en http://localhost:${PORT}\n`);
  console.log(`📍 Endpoints de autenticación:`);
  console.log(`   POST http://localhost:${PORT}/register`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`   GET  http://localhost:${PORT}/auth/me\n`);
  console.log(`👥 CRUD de Usuarios:`);
  console.log(`   GET    http://localhost:${PORT}/users`);
  console.log(`   GET    http://localhost:${PORT}/users/:id`);
  console.log(`   POST   http://localhost:${PORT}/users (solo Admin)`);
  console.log(`   PUT    http://localhost:${PORT}/users/:id (solo Admin)`);
  console.log(`   PATCH  http://localhost:${PORT}/users/:id (solo Admin)`);
  console.log(`   DELETE http://localhost:${PORT}/users/:id (solo Admin)\n`);
  console.log(`📋 CRUD de Tareas:`);
  console.log(`   GET    http://localhost:${PORT}/tasks`);
  console.log(`   GET    http://localhost:${PORT}/tasks/user/:userId`);
  console.log(`   GET    http://localhost:${PORT}/tasks/:id`);
  console.log(`   POST   http://localhost:${PORT}/tasks`);
  console.log(`   PUT    http://localhost:${PORT}/tasks/:id`);
  console.log(`   DELETE http://localhost:${PORT}/tasks/:id\n`);
});

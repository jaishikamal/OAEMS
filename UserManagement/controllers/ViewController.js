/**
 * View Controller - Handles rendering of views
 * Factory function that takes models
 */

module.exports = (models) => {
  if (!models) {
    throw new Error('Models not provided to ViewController');
  }

  const User = models.User;
  const Role = models.Role;
  const Permission = models.Permission;
  const Branch = models.Branch;
  const AuditLog = models.AuditLog;

  return {
    /**
     * Render Dashboard
     */
    renderDashboard: async (req, res) => {
        try {
            const stats = {
                totalUsers: await User.count(),
                activeUsers: await User.count({ where: { status: 'active' } }),
                suspendedUsers: await User.count({ where: { status: 'suspended' } }),
                lockedUsers: await User.count({ where: { isLocked: true } }),
                totalRoles: await Role.count(),
                totalBranches: await Branch.count(),
                totalPermissions: await Permission.count()
            };

            const recentLogs = await AuditLog.findAll({
                include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
                order: [['createdAt', 'DESC']],
                limit: 10,
                attributes: ['id', 'module', 'action', 'createdAt']
            });

            res.render('usermanagement/dashboard', {
                page: 'dashboard',
                title: 'Dashboard',
                stats,
                recentLogs
            });
        } catch (error) {
            console.error('Dashboard render error:', error);
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render User List
     */
    renderUserList: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const limit = 10;
            const offset = (page - 1) * limit;

            const { count, rows: users } = await User.findAndCountAll({
                include: [
                    { model: Role, as: 'roles', through: { attributes: [] } },
                    { model: Branch, as: 'branches', through: { attributes: [] } }
                ],
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            res.render('usermanagement/users/list', {
                page: 'users',
                title: 'Users',
                users,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Create User Form
     */
    renderCreateUser: async (req, res) => {
        try {
            const roles = await Role.findAll({ where: { status: 'active' } });
            const branches = await Branch.findAll({ where: { status: 'active' } });

            res.render('usermanagement/users/create', {
                page: 'users',
                title: 'Create User',
                roles,
                branches
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render View User
     */
    renderViewUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id, {
                include: [
                    { model: Role, as: 'roles' },
                    { model: Branch, as: 'branches' }
                ]
            });

            if (!user) {
                return res.status(404).render('error', { error: 'User not found' });
            }

            res.render('usermanagement/users/view', {
                page: 'users',
                title: user.firstName + ' ' + user.lastName,
                user
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Edit User Form
     */
    renderEditUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id, {
                include: [
                    { model: Role, as: 'roles' },
                    { model: Branch, as: 'branches' }
                ]
            });

            if (!user) {
                return res.status(404).render('error', { error: 'User not found' });
            }

            const branches = await Branch.findAll({ where: { status: 'active' } });

            res.render('usermanagement/users/edit', {
                page: 'users',
                title: 'Edit User',
                user,
                branches
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Change Password Form
     */
    renderChangePassword: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);

            if (!user) {
                return res.status(404).render('error', { error: 'User not found' });
            }

            res.render('usermanagement/users/change-password', {
                page: 'users',
                title: 'Change Password',
                user
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Role List
     */
    renderRoleList: async (req, res) => {
        try {
            const roles = await Role.findAll({
                include: [
                    { model: Permission, as: 'permissions', through: { attributes: [] } },
                    { model: User, as: 'users', through: { attributes: [] } }
                ],
                order: [['priority', 'ASC']]
            });

            res.render('usermanagement/roles/list', {
                page: 'roles',
                title: 'Roles',
                roles
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Create Role Form
     */
    renderCreateRole: async (req, res) => {
        try {
            const permissions = await Permission.findAll({ where: { status: 'active' } });

            res.render('usermanagement/roles/create', {
                page: 'roles',
                title: 'Create Role',
                permissions
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render View Role
     */
    renderViewRole: async (req, res) => {
        try {
            const role = await Role.findByPk(req.params.id, {
                include: [
                    { model: Permission, as: 'permissions' },
                    { model: User, as: 'users' }
                ]
            });

            if (!role) {
                return res.status(404).render('error', { error: 'Role not found' });
            }

            res.render('usermanagement/roles/view', {
                page: 'roles',
                title: role.name,
                role
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Edit Role Form
     */
    renderEditRole: async (req, res) => {
        try {
            const role = await Role.findByPk(req.params.id, {
                include: [{ model: Permission, as: 'permissions' }]
            });

            if (!role) {
                return res.status(404).render('error', { error: 'Role not found' });
            }

            const permissions = await Permission.findAll({ where: { status: 'active' } });

            res.render('usermanagement/roles/edit', {
                page: 'roles',
                title: 'Edit Role',
                role,
                permissions
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Permissions List
     */
    renderPermissionList: async (req, res) => {
        try {
            const permissions = await Permission.findAll({
                order: [['module', 'ASC'], ['code', 'ASC']]
            });

            res.render('usermanagement/permissions/list', {
                page: 'permissions',
                title: 'Permissions',
                permissions
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Create Permission Form
     */
    renderCreatePermission: async (req, res) => {
        try {
            res.render('usermanagement/permissions/create', {
                page: 'permissions',
                title: 'Create Permission'
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Edit Permission Form
     */
    renderEditPermission: async (req, res) => {
        try {
            const permission = await Permission.findByPk(req.params.id);

            if (!permission) {
                return res.status(404).render('error', { error: 'Permission not found' });
            }

            res.render('usermanagement/permissions/edit', {
                page: 'permissions',
                title: 'Edit Permission',
                permission
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Branches List
     */
    renderBranchList: async (req, res) => {
        try {
            const branches = await Branch.findAll({
                include: [{ model: User, as: 'users', through: { attributes: [] } }],
                order: [['name', 'ASC']]
            });

            res.render('usermanagement/branches/list', {
                page: 'branches',
                title: 'Branches',
                branches
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Create Branch Form
     */
    renderCreateBranch: async (req, res) => {
        try {
            const branches = await Branch.findAll({
                where: { status: 'active' },
                order: [['name', 'ASC']]
            });

            res.render('usermanagement/branches/create', {
                page: 'branches',
                title: 'Create Branch',
                branches
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render View Branch
     */
    renderViewBranch: async (req, res) => {
        try {
            const branch = await Branch.findByPk(req.params.id, {
                include: [{ model: User, as: 'users' }]
            });

            if (!branch) {
                return res.status(404).render('error', { error: 'Branch not found' });
            }

            res.render('usermanagement/branches/view', {
                page: 'branches',
                title: branch.name,
                branch
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Edit Branch Form
     */
    renderEditBranch: async (req, res) => {
        try {
            const branch = await Branch.findByPk(req.params.id);

            if (!branch) {
                return res.status(404).render('error', { error: 'Branch not found' });
            }

            const branches = await Branch.findAll({
                where: { status: 'active' },
                order: [['name', 'ASC']]
            });

            res.render('usermanagement/branches/edit', {
                page: 'branches',
                title: 'Edit Branch',
                branch,
                branches
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Audit Logs
     */
    renderAuditLogs: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const limit = 20;
            const offset = (page - 1) * limit;

            const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
                include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
                order: [['createdAt', 'DESC']],
                limit,
                offset
            });

            res.render('usermanagement/audit/list', {
                page: 'audit',
                title: 'Audit Logs',
                auditLogs,
                currentPage: page,
                totalPages: Math.ceil(count / limit)
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Profile Page
     */
    renderProfile: async (req, res) => {
        try {
            const currentUser = await User.findByPk(req.user.id, {
                include: [
                    { model: Role, as: 'roles' },
                    { model: Branch, as: 'branches' }
                ]
            });

            res.render('usermanagement/profile', {
                page: 'profile',
                title: 'My Profile',
                currentUser
            });
        } catch (error) {
            res.status(500).render('error', { error });
        }
    },

    /**
     * Render Login Page
     */
    renderLogin: (req, res) => {
        res.render('usermanagement/auth/login', {
            title: 'Login - OAEMS'
        });
    }
  };
};

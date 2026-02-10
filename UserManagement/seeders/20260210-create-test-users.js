/**
 * Seeder for Initial Test Users
 * 
 * Usage: npx sequelize-cli db:seed:all
 * 
 * Creates test admin user for initial login
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get admin role
      const adminRole = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE code = 'ADMIN' LIMIT 1`
      );

      if (!adminRole[0] || adminRole[0].length === 0) {
        console.warn('⚠️ Admin role not found. Run role seeder first!');
        return;
      }

      const adminRoleId = adminRole[0][0].id;

      // Hash password
      const hashedPassword = await bcrypt.hash('admin@123456', 10);

      // Create admin user
      const userId = uuidv4();
      
      await queryInterface.bulkInsert('users', [
        {
          id: userId,
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@oaems.local',
          username: 'admin',
          password: hashedPassword,
          phone: '+1-234-567-8900',
          status: 'active',
          is_locked: false,
          failed_login_attempts: 0,
          last_login: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

      console.log('✅ Admin user created successfully!');
      console.log('   📧 Email: admin@oaems.local');
      console.log('   🔐 Password: admin@123456');
      console.log('   👤 Username: admin');

      // Assign admin role to user
      await queryInterface.bulkInsert('user_roles', [
        {
          id: uuidv4(),
          userId: userId,
          roleId: adminRoleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      console.log('✅ Admin role assigned to user');

      // Create test manager user
      const managerRoleData = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE code = 'BRANCH_MANAGER' LIMIT 1`
      );

      if (managerRoleData[0] && managerRoleData[0].length > 0) {
        const managerRoleId = managerRoleData[0][0].id;
        const managerId = uuidv4();
        const managerPassword = await bcrypt.hash('manager@123456', 10);

        await queryInterface.bulkInsert('users', [
          {
            id: managerId,
            first_name: 'John',
            last_name: 'Manager',
            email: 'manager@oaems.local',
            username: 'manager',
            password: managerPassword,
            phone: '+1-234-567-8901',
            status: 'active',
            is_locked: false,
            failed_login_attempts: 0,
            last_login: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);

        await queryInterface.bulkInsert('user_roles', [
          {
            id: uuidv4(),
            userId: managerId,
            roleId: managerRoleId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        console.log('✅ Manager user created successfully!');
        console.log('   📧 Email: manager@oaems.local');
        console.log('   🔐 Password: manager@123456');
      }

      // Create test auditor user
      const auditorRoleData = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE code = 'AUDITOR' LIMIT 1`
      );

      if (auditorRoleData[0] && auditorRoleData[0].length > 0) {
        const auditorRoleId = auditorRoleData[0][0].id;
        const auditorId = uuidv4();
        const auditorPassword = await bcrypt.hash('auditor@123456', 10);

        await queryInterface.bulkInsert('users', [
          {
            id: auditorId,
            first_name: 'Sarah',
            last_name: 'Auditor',
            email: 'auditor@oaems.local',
            username: 'auditor',
            password: auditorPassword,
            phone: '+1-234-567-8902',
            status: 'active',
            is_locked: false,
            failed_login_attempts: 0,
            last_login: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);

        await queryInterface.bulkInsert('user_roles', [
          {
            id: uuidv4(),
            userId: auditorId,
            roleId: auditorRoleId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);

        console.log('✅ Auditor user created successfully!');
        console.log('   📧 Email: auditor@oaems.local');
        console.log('   🔐 Password: auditor@123456');
      }

    } catch (error) {
      console.error('❌ Error seeding users:', error.message);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Delete test users and their roles
      await queryInterface.sequelize.query(`
        DELETE FROM user_roles 
        WHERE user_id IN (
          SELECT id FROM users 
          WHERE email IN ('admin@oaems.local', 'manager@oaems.local', 'auditor@oaems.local')
        )
      `);

      await queryInterface.sequelize.query(`
        DELETE FROM users 
        WHERE email IN ('admin@oaems.local', 'manager@oaems.local', 'auditor@oaems.local')
      `);

      console.log('✅ Test users deleted');
    } catch (error) {
      console.error('❌ Error rolling back users:', error.message);
      throw error;
    }
  },
};

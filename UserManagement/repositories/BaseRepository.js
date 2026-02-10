/**
 * Base Repository - Generic CRUD operations
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    try {
      return await this.model.findAll(options);
    } catch (error) {
      throw new Error(`Error finding all records: ${error.message}`);
    }
  }

  async findById(id, options = {}) {
    try {
      return await this.model.findByPk(id, options);
    } catch (error) {
      throw new Error(`Error finding record by id: ${error.message}`);
    }
  }

  async findOne(where, options = {}) {
    try {
      return await this.model.findOne({ where, ...options });
    } catch (error) {
      throw new Error(`Error finding one record: ${error.message}`);
    }
  }

  async create(data, options = {}) {
    try {
      return await this.model.create(data, options);
    } catch (error) {
      throw new Error(`Error creating record: ${error.message}`);
    }
  }

  async update(id, data, options = {}) {
    try {
      const record = await this.findById(id);
      if (!record) {
        throw new Error("Record not found");
      }
      return await record.update(data, options);
    } catch (error) {
      throw new Error(`Error updating record: ${error.message}`);
    }
  }

  async delete(id, options = {}) {
    try {
      const record = await this.findById(id);
      if (!record) {
        throw new Error("Record not found");
      }
      return await record.destroy(options);
    } catch (error) {
      throw new Error(`Error deleting record: ${error.message}`);
    }
  }

  async count(where = {}, options = {}) {
    try {
      return await this.model.count({ where, ...options });
    } catch (error) {
      throw new Error(`Error counting records: ${error.message}`);
    }
  }

  async paginate(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        offset = 0,
        order = [["createdAt", "DESC"]],
        where = {},
        include = [],
        ...rest
      } = options;

      const { rows, count } = await this.model.findAndCountAll({
        where,
        include,
        order,
        limit,
        offset: (page - 1) * limit || offset,
        distinct: true,
        ...rest,
      });

      return {
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error paginating records: ${error.message}`);
    }
  }

  async bulkCreate(data, options = {}) {
    try {
      return await this.model.bulkCreate(data, options);
    } catch (error) {
      throw new Error(`Error bulk creating records: ${error.message}`);
    }
  }

  async bulkUpdate(data, where, options = {}) {
    try {
      return await this.model.update(data, { where, ...options });
    } catch (error) {
      throw new Error(`Error bulk updating records: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;

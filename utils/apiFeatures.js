// Using class to implement filtering and sorting....

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt"); // This will be the default sort
    }

    return this;
  }

  limitFields() {
    // 3) Field Limitting

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v"); // This will be not shown in the data always (hide)
    }

    return this;
  }

  paginate() {
    // 4) Pagination

    const page = this.queryString.page * 1 || 1; // *1 to make it a number and || 1 means default value
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit; // ex: if need page 3 and limit is 10 that mean we need to show 21-30 results. so that mean (3-1)*10 = 20

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

export class DBQuery {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;

    console.log("REACHED DB FEATURES", this.queryString);
  }

  filter() {
    const queryObj = { ...this.queryString };

    queryObj.deleted = false;

    const excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "isVerified",
      "passcode",
      "password",
      "smsOtp",
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    console.log("OUR QUERY OBJ", queryObj);

    // advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let newQueryObj = JSON.parse(queryStr);

    const regex = {};

    // loop through each key-value pair in the searchterm object and create a regex pattern
    for (const key in newQueryObj) {
      if (newQueryObj.hasOwnProperty(key)) {
        const value = newQueryObj[key];
        if (
          typeof value === "string" &&
          value !== "false" &&
          value !== "true"
        ) {
          regex[key] = new RegExp(value, "i");
        } else {
          regex[key] = value;
        }
      }
    }

    console.log("REGEXXXX", regex);

    this.query = this.query.find(regex);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString?.sort?.split(",")?.join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString?.fields?.split(",")?.join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v -password");
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    let limit = this.queryString.limit || 100;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    this.page = page;

    return this;
  }

  //   async countDocuments() {
  //     const queryObj = { ...this.queryString };
  //     const excludedFields = ["page", "sort", "limit", "fields"];
  //     excludedFields.forEach((el) => delete queryObj[el]);
  //     let queryStr = JSON.stringify(queryObj);
  //     queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  //     const count = await this.query.model.countDocuments(queryStr);

  //     // Append the count to the result
  //     this.query.results = {
  //       totalDocs: count,
  //       docs: this.query,
  //     };

  //     console.log("OBJ RES", this.query.results);

  //     return this;
  //   }
}

export class DBQueryCount {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;

    console.log("REACHED DB FEATURES", this.queryString);
  }

  filter() {
    const queryObj = { ...this.queryString };

    queryObj.deleted = false;

    const excludedFields = [
      "page",
      "sort",
      "limit",
      "fields",
      "isVerified",
      "passcode",
      "password",
      "smsOtp",
    ];
    excludedFields.forEach((el) => delete queryObj[el]);

    console.log("OUR QUERY OBJ", queryObj);

    // advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let newQueryObj = JSON.parse(queryStr);

    const regex = {};

    // loop through each key-value pair in the searchterm object and create a regex pattern
    for (const key in newQueryObj) {
      if (newQueryObj.hasOwnProperty(key)) {
        const value = newQueryObj[key];
        if (
          typeof value === "string" &&
          value !== "false" &&
          value !== "true"
        ) {
          regex[key] = new RegExp(value, "i");
        } else {
          regex[key] = value;
        }
      }
    }

    console.log("REGEXXXX", regex);

    this.totalCount = this.query.find(regex).countDocuments();

    return this;
  }
}

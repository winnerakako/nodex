import { Document, Query } from "mongoose";

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any; // This makes it flexible for other query parameters
}

// Common excluded fields for both classes
const excludedFields = ["page", "sort", "limit", "fields", "password"];

// Helper function to clean the query object and apply regex
function buildRegexQuery(queryObj: QueryString): { [key: string]: any } {
  const filteredQueryObj = { ...queryObj };

  excludedFields.forEach((el) => delete filteredQueryObj[el]);
  let queryStr = JSON.stringify(filteredQueryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  const newQueryObj = JSON.parse(queryStr);

  const regex: { [key: string]: any } = {};
  for (const key in newQueryObj) {
    if (newQueryObj.hasOwnProperty(key)) {
      const value = newQueryObj[key];
      if (typeof value === "string" && value !== "false" && value !== "true") {
        regex[key] = new RegExp(value, "i");
      } else {
        regex[key] = value;
      }
    }
  }

  return regex;
}

// Base query class for common functionalities
class BaseDBQuery<T extends Document> {
  protected query: Query<T[], T>;
  protected queryString: QueryString;
  public page: number | undefined;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): this {
    const regex = buildRegexQuery(this.queryString);
    this.query = this.query.find(regex);
    return this;
  }

  sort(): this {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields(): this {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v -password");
    }

    return this;
  }

  paginate(): this {
    const page = parseInt(this.queryString.page as string) || 1;
    let limit = parseInt(this.queryString.limit as string, 10) || 100;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    return this;
  }
}

// DBQuery class extends the base query class
export class DBQuery<T extends Document> extends BaseDBQuery<T> {
  constructor(query: Query<T[], T>, queryString: QueryString) {
    super(query, queryString);
    console.log("REACHED DBQuery", this.queryString);
  }
}

// DBQueryCount class extends the base query class and adds count functionality
export class DBQueryCount<T extends Document> extends BaseDBQuery<T> {
  public totalCount: Promise<number> | undefined;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    super(query, queryString);
    console.log("REACHED DBQueryCount", this.queryString);
  }

  // This function adds counting functionality
  count(): this {
    const regex = buildRegexQuery(this.queryString);
    this.totalCount = this.query.find(regex).countDocuments();
    return this;
  }
}

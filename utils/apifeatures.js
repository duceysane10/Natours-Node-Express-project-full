class apiFeatures {
    constructor(query,queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    
    //////////////////////////////////////
    /////  All methodes 
    
    filter () {
        //  1A) Filttering
    // console.log(req.query);
    // creating New Object query 
    const queryObj = {...this.queryStr};
    //  Waxaa ladiidaa in datbase ka lasoo query gareeto arrayda hoose fieldska ku jiro siada Page
    const excludedFields = ['page', 'sort', 'limit','fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    // console.log(queryObj);
    // const tours = await Tour.find(queryObj);
    
    //  1B) Advanced Filttering
    // converting Json query to String
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|ge|lte|lt)\b/g,match => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    
    return this;
    
    }
    // Sort function
    Sort(){
        // 2) Sorting results by price and ratingsAverage
    if(this.queryStr.sort){
        const sortBy = this.queryStr.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
    }else {
        // if the user not specified Sorting
        this.query = this.query.sort('-createdAt');
    }
    return this;
    }
    
    // Limiting function
    limit(){
           // 3) Fields Limiting 
    if(this.queryStr.fields){
        const fields = this.queryStr.fields.split(',').join(' ');
        
        this.query = this.query.select(fields);
    }
    else{
        // if the user not specified Limit
        this.query = this.query.select('-__v');
    }
    return this;
    }
    
    // pagination function
    paginate(){
           // 4) pagination
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    
    return this;
    }
}

module.exports = apiFeatures;
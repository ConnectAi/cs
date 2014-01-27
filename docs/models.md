## Models
`/models/file.js`

    class File extends app.Model {

        upload(files) {
            // ...upload a file
            return ...
        }

    );
    module.exports = File;


### app.db (mysql package)
- Methods can be freely called from `app.db`.
- Methods can be called on a model where the model's defaults are set.
- All methods return a `when.js` deferred.
- All queries are logged to `./app.log`

#### save / update
	app.db.save( data, [table], [primaryKey]);
		// data is either an array of objects (bulk insert)
		// or single object
			// if single object has primaryKey is set (Update)
			// if the primaryKey isn't set (Update)
		// pass a table if you don't want to use the default table for that model
		// pass a primaryKey if wanting Update and pkey is not "id"
		// returns ID of updated row or Inserted row


#### delete
	app.db.delete(where, [table])
		// delete passing a where string
		// change table optional
		// returns deleted ID

#### get by id
	app.db.findById(id, [table])
	// returns array

#### get by any where
	app.db.find(where, [table])
	// returns array

#### get all by any where
	app.db.findAll(where, [table])
	// returns array of arrays

#### raw query get one value
	app.db.queryValue(sql)
	// returns single value

#### raw query get single row
	app.db.querySingle(sql)
	// returns array

#### raw query get many row
	app.db.queryMulti(sql)
	// returns array of arrays (identical to app.db.query)

#### raw query
	app.db.query(sql)
	// returns the full query result
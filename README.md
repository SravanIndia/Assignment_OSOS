# Assignment_OSOS
A Node.Js approach to index the data from MongoDB Atlas on to Elastic Search and find the nearest restaurants based on given input.
Here, the initial data is stored in MongoDB atlas.
Later, the data is indexed from MongoDB atlas on to Elastic Search locally using Moongoosastic.
Then geo_distance filter is applied on the indexed data and only those restaurants are selected that are within a give range.
The input is taken from the Url params.


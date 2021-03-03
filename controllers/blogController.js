const { pivotDb, pivotPoolDb } = require("../connection.js");


// ----------------------------------------------------------
// Returns a list of all Blogs
// ----------------------------------------------------------
exports.getBlogs = (req, res) => {

    let sBlogId       = pivotDb.escape(req.query.blogId).replace(/['']+/g, '');
    let sInstructorId = pivotDb.escape(req.query.instructorId).replace(/['']+/g, '');

    // Set filters
    let sWhere = " WHERE 1 = 1 ";
    if (sBlogId != "" && sBlogId.toLowerCase() != "null") {
        sWhere = sWhere + ` AND b.blogId = ${sBlogId} `;
    }
    if (sInstructorId != "" && sInstructorId.toLowerCase() != "null") {
        sWhere = sWhere + ` AND b.instructorId = ${sInstructorId} `;
    }

    let qry = `SELECT b.blogId AS blogId, b.title AS blogTitle, content AS blogContent, b.postDate AS orderedDate,
                      DATE_FORMAT(b.postDate, "%b %d %Y") as blogPostDate, b.imageFileBlog as blogImageFile, b.imageFileThumb as blogThumbImageFile,   
                      b.instructorId, l.name as instructorName, l.imageFile as instructorImage,
                      t.tagId, t.name as tagName
                 FROM blogs b
                      INNER JOIN instructors i  ON (b.instructorId = i.instructorId)
                      INNER JOIN login l ON (i.instructorId = l.loginId)
                      LEFT JOIN blogTags bt ON (b.blogId = bt.blogId)
                      LEFT JOIN tags t ON (bt.tagId = t.tagId)
             ${sWhere}        
            ORDER BY  orderedDate, blogId desc, tagName `;

    pivotPoolDb.then(pool => {
        pool.query(qry)
            .then(results => {
                if (results.length == 0) {
                    res.status(404).send("No Record Found");
                } else {

                    let vBlogs = [];
                    let iBlogId = -1;
                    let i = 0;

                    while (i < results.length) {
                        let vBlog = {};
                        let vTags = [];
                        let iBlogBase = i;
                        iBlogId = results[iBlogBase].blogId;

                        // Creates array of all the tags for the blog
                        while (i < results.length && iBlogId == results[i].blogId) {
                            vTags.push({
                                tagId: results[i].tagId,
                                tagName: results[i].tagName
                            });
                            i++;
                        }

                        vBlog = {
                            blogId: results[iBlogBase].blogId,
                            blogTitle: results[iBlogBase].blogTitle,
                            blogContent: results[iBlogBase].blogContent,
                            blogPostDate: results[iBlogBase].blogPostDate,
                            blogImageFile: results[iBlogBase].blogImageFile,
                            blogThumbImageFile: results[iBlogBase].blogThumbImageFile,
                            instructorId: results[iBlogBase].instructorId,
                            instructorName: results[iBlogBase].instructorName,
                            instructorImage: results[iBlogBase].instructorImage,
                            tags: vTags
                        };

                        vBlogs.push(vBlog);
                    };

                    res.status(200).send(vBlogs);
                }
            })
            .catch(error => {
                console.log(error);
                res.status(500).send(error);
            })
    })
        .catch(error => {
            console.log(error);
            res.status(500).send(error);
        });

};




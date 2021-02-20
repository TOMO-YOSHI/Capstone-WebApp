const { pivotDb, pivotPoolDb } = require("../connection.js");
const {check, validationResult} = require("express-validator");


// ----------------------------------------------------------
// Returns a list of all Companies
// ----------------------------------------------------------
exports.getCompanies = (req, res) => {
    let qry = `SELECT c.companyId, l.name as companyName
                 FROM companies c
                      INNER JOIN login l ON (c.companyId = l.loginId) 
                ORDER BY companyName`;
  
    pivotPoolDb.then(pool =>{
      pool.query(qry)
          .then(results => {
              if (results.length == 0) {
                res.status(404).send("No Record Found");
              } else {
                res.status(200).send(results);
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


// ----------------------------------------------------------
// Returns the company profile data
// ----------------------------------------------------------
exports.getCompany = (req, res) => {

    let companySearch = async (req) => {

        let sCompanyId = pivotDb.escape(req.query.companyId).replace(/['']+/g, '');
        if (sCompanyId == "" || sCompanyId.toLowerCase() == "null") {
            sCompanyId = '-1';
        }

        let vCompany = {};
        let vEmployees = [];
        let vResult = {};

        let qry = `SELECT c.companyId, l.userLogin, l.name as companyName, c.accountResponsible, c.contactEmail, c.phoneNumber, c.address, ct.name as cityName, 
                      p.name as provinceName, p.provinceId as provinceCode, c.postalCode, l.imageFile
                 FROM companies c
                      INNER JOIN login l ON (c.companyId = l.loginId)
                      LEFT OUTER JOIN cities ct ON (c.cityId = ct.cityId)
                      LEFT OUTER JOIN provinces p ON (ct.provinceId = p.provinceId)
                WHERE c.companyId = ${sCompanyId} `;

        pivotPoolDb.then(pool => {
            pool.query(qry)
                .then(results => {
                    if (results.length == 0) {
                        vCompany = {}
                    } else {
                        vCompany = results[0];
                    }
                })
                .then(results => {
                    if (vCompany.companyId != undefined) {
                        let qry = `SELECT e.name as employeeName, e.employeeId, w.name as departmentName
                                     FROM employees e 
                                          INNER JOIN workDepartments w ON (e.workDepartmentId = w.workDepartmentId)
                                    WHERE e.companyId = ${sCompanyId} ORDER BY employeeName`;
                         return pool.query(qry);
                    }
                 })
                 .then(results => {

                    if (vCompany.companyId == undefined) {
                        res.status(404).send("No Record Found");
                    } else {

                        results.forEach(element => {
                            vEmployees.push({ employeeName: element.employeeName,
                                              employeeId  : element.employeeId,
                                              departmentName : element.departmentName
                                            });                        
                        });
    
                        vResult = {
                             companyId: vCompany.companyId,
                             userLogin: vCompany.userLogin,
                             companyName: vCompany.companyName,
                             accountResponsible: vCompany.accountResponsible,
                             contactEmail: vCompany.contactEmail,
                             phoneNumber: vCompany.phoneNumber,
                             address: vCompany.address,
                             cityName: vCompany.cityName,
                             provinceName: vCompany.provinceName,
                             provinceCode: vCompany.provinceCode,
                             postalCode: vCompany.postalCode,
                             imageFile: vCompany.imageFile,
                             employees: vEmployees
                        };
    
                        res.status(200).send(vResult);
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

    companySearch(req);

};




// ----------------------------------------------------------
// Updates the instructor profile data
// ----------------------------------------------------------
exports.updCompany = (req, res) => {

    let companyUpdate = async (req) => {

        const valError = validationResult(req).array();
        //console.log(valError);

        if (valError.length > 0) {
            res.status(500).send(valError);
        } else { 

            let sMessageInfo  = ''; 
            let objCompany = req.body;
            //console.log(objCompany);
    
            let sCompanyId = pivotDb.escape(objCompany.companyId).replace(/['']+/g, '');
            if (sCompanyId == "" || sCompanyId.toLowerCase() == "null") {
                sCompanyId = '-1';
                sMessageInfo = 'Valid instructorId not found'
            }
    
            let sSet = 'SET ';        
            if (sMessageInfo == '') {
                if (objCompany.accountResponsible != undefined) {
                    sSet = sSet + ` accountResponsible = "${objCompany.accountResponsible}", `;
                }
                if (objCompany.contactEmail != undefined) {
                    sSet = sSet + `contactEmail = "${objCompany.contactEmail}", `;
                }            
                if (objCompany.phoneNumber != undefined) {
                    sSet = sSet + `phoneNumber = "${objCompany.phoneNumber}", `;
                }              
                if (objCompany.address != undefined) {
                    sSet = sSet + `address = "${objCompany.address}", `;
                }              
                if (objCompany.postalCode != undefined) {
                    sSet = sSet + `postalCode = "${objCompany.postalCode}", `;
                }                
                if (objCompany.cityName != '' && objCompany.cityName != undefined && 
                    objCompany.provinceCode != '' && objCompany.provinceCode != undefined) {
                    sSet = sSet + `cityId = ( SELECT cityId FROM cities 
                                               WHERE provinceId = "${objCompany.provinceCode}" 
                                                 AND name = "${objCompany.cityName.toLowerCase()}" ) , `;
                } 
    
                let ultComma = sSet.lastIndexOf(",");
                if (ultComma > 0) {
                    sSet = sSet.substring(0,ultComma);  
                }   
            }
    
            let sSetUser = 'SET ';
            if (sMessageInfo == '') {
                if (objCompany.companyName != '' && objCompany.companyName != undefined) {
                    sSetUser = sSetUser + ` name = "${objCompany.companyName}", `;
                }   
                if (objCompany.imageFile != '' && objCompany.imageFile != undefined) {
                    sSetUser = sSetUser + ` imageFile = "${objCompany.imageFile}", `;
                }    
                let ultComma = sSetUser.lastIndexOf(",");
                if (ultComma > 0) {
                    sSetUser = sSetUser.substring(0,ultComma);  
                }     
            } 
    
            if (sCompanyId != '-1' && sSet == 'SET ' && sSetUser == 'SET ') {
                sMessageInfo = 'No content to update';
            }
            if (sMessageInfo != '') {
                let myResult = {
                    messageInfo: sMessageInfo,
                    object: objCompany
                };
                res.status(500).send(myResult);
            } else {
        
                let resCompanies = '';
                let resUsers = '';
                let qry = `UPDATE companies ${sSet} 
                            WHERE companyId = ${sCompanyId}  `;
    
                pivotPoolDb.then(pool => {
                    pool.query(qry)
                        .then(results => {
                            resCompanies = results;
                            if (resCompanies.affectedRows == 0) {
                               sMessageInfo = 'No Records found' 
                            } else {
                               sMessageInfo = 'Record Updated'
                            }
                        })
                        .then(results => {
                            if (sSetUser != 'SET ') {
                                let qry = `UPDATE login ${sSetUser} 
                                            WHERE loginId = ${sCompanyId}  `;
                                 return pool.query(qry);
                            }
                        })
                        .then(results => {
                            resUsers = results;
                            if (sSetUser != 'SET ' && resUsers.affectedRows == 0) {
                                sMessageInfo = 'No Records found' 
                             } else {
                                sMessageInfo = 'Record Updated'
                             }
         
                             let myResult = {
                                 messageInfo: sMessageInfo,
                                 sqlCompany: resCompanies,
                                 sqlUser   : resUsers
                             };
                             res.status(200).send(myResult);
    
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
            }
        }
    };

    companyUpdate(req);
}    


//----------------------------------------------------
// Validations
//----------------------------------------------------

// ----------------------------------------------------------
// Check if the ID Belongs to an company
// ----------------------------------------------------------
const isCompany = async value => {
    let qry = `SELECT companyId from companies WHERE companyId = ${value} `;
    await pivotPoolDb.then(pool =>{
      pool.query(qry)
          .then(results => {
             // console.log('vini');
             // console.log(results.length);
              if (results.length == 0) {
                 return false;
              } else {
                 return true;
              }
          })
    })
    .catch(error => {
      console.log(error);
    }); 
}


exports.companyValidation = [

    // company id validation
    check("companyId")
    .escape()
    .trim()
    .notEmpty().withMessage("Must have a valid companyId")
    .isInt().withMessage("CompanyId must be an integer")
    .custom(isCompany).withMessage("Id is not a valid company"),

    // company name validation
    check("companyName")
    .escape()
    .trim()
    .isLength({min:1, max:40}).withMessage("Company Name must be between 1 and 40 characters"),
    
    // contact email validation
    check("contactEmail")
    .escape()
    .trim()
    .isEmail().withMessage("Not a valid email"),   

    // phone number validation
    check("phoneNumber")
    .escape()
    .trim()
    .isNumeric().withMessage("Phone number must be numeric values"),  
    
    // address validation
    check("address")
    .escape()
    .trim()
    .isLength({min:1, max:200}).withMessage("Address must be between 1 and 200 characters") 

];








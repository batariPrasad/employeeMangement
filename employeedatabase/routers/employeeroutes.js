const express = require("express");
const router = express.Router();
const employeeApi = require('../controllers/employeeapi');

// Route to save employee
router.post('/saveemployee', employeeApi.upload.single('employeeimage'), employeeApi.saveEmployee);

// Route to search employee email
router.post('/searchemail', employeeApi.searchEmail);

// Route to get all employees
router.get("/getemployeelist", employeeApi.employeGet);

// Route to get employee details by ID
router.post("/getemployeedetails", employeeApi.getEDetails);

// Route to update employee details
router.post("/updateemployeedetails", employeeApi.upload.single('employeeimage'), employeeApi.updateEmployeeDetails);

// Route to delete employee and image
router.post("/deleteemployee", employeeApi.deleteEmployee);

module.exports = router;

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Employee = require('../models/employeeschema');
const multer = require('multer');

// Storage configuration for multer
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'employeeimages');
    },
    filename: function(req, file, cb) {   
        cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

let upload = multer({ storage, fileFilter });

// Function to save new employee
const saveEmployee = async (req, res) => {
    const { name, mobile, email, designation, gender, course, date } = req.body;
    const image = req.file.filename;

    const newEmployee = new Employee({
        name,
        mobile,
        email,
        designation,
        gender,
        course,
        date,
        image
    });

    try {
        await newEmployee.save();
        res.json('Employee Added');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};

// Function to search email
const searchEmail = async (req, res) => {
    const searchValue = req.body.search;
    const email = await Employee.find({ email: searchValue });
    if (email.length > 0)
        res.status(200).json({ message: true });
    else
        res.status(200).json({ message: false });
};

// Function to get employee list
const employeGet = async (req, res) => {
    const employeeList = await Employee.find();
    res.status(200).json(employeeList);
};

// Function to get employee details
const getEDetails = async (req, res) => {
    const { id } = req.body;
    const employee = await Employee.findById(id);
    res.status(200).json(employee);
};

// Function to update employee details
const updateEmployeeDetails = async (req, res) => {
    const { id, name, email, mobile, designation, gender, course, date } = req.body;
    const employee = await Employee.findById(id);

    employee.name = name;
    employee.email = email;
    employee.mobile = mobile;
    employee.designation = designation;
    employee.gender = gender;
    employee.course = course;
    employee.date = date;
    employee.image = req.file.filename;

    try {
        await employee.save();
        res.status(200).json({ message: "Employee Updated Successfully" });
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
};

// Function to delete employee
const deleteEmployee = async (req, res) => {
    const { id } = req.body;
    const employee = await Employee.findById(id);

    if (employee) {
        const imagePath = path.join(__dirname, '..', 'employeeimages', employee.image);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting image:', err);
                return res.status(500).json({ message: 'Error deleting image' });
            }

            employee.deleteOne()
                .then(() => res.status(200).json({ message: "Employee and image deleted successfully" }))
                .catch(err => res.status(400).json({ message: 'Error deleting employee: ' + err }));
        });
    } else {
        res.status(404).json({ message: 'Employee not found' });
    }
};

module.exports = {
    saveEmployee,
    searchEmail,
    employeGet,
    getEDetails,
    updateEmployeeDetails,
    deleteEmployee,
    upload
};

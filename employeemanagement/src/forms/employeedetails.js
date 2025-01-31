import { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { Navigate } from "react-router-dom";
import { apipath } from "../data/apipath";
import axios from 'axios';

const Employeedetails = () => {
    let [name, pickname] = useState("");
    let [email, pickemail] = useState("");
    let [mobile, pickmobile] = useState("");
    let [designation, pickdesignation] = useState("");
    let [gender, pickgender] = useState("");
    let [course, pickcourse] = useState([]); // State to store selected courses as an array
    let [image, pickimage] = useState(null); // State to store the selected image file
    let [button, pickbutton] = useState("Save");
    let [searchkey, picksearchkey] = useState("");
    let [employeeid, pickemployeeid] = useState("");
    let [photo, pickphoto] = useState(""); // State to store the existing photo URL
    let [emailerror, pickemailerror] = useState("");

    const checkemail = (email) => {
        let epatern = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (epatern.test(email)) {
            let url = `${apipath}/employee/searchemail`;
            let postData = {
                headers: { 'Content-Type': 'application/json' },
                method: "post",
                body: JSON.stringify({ search: email })
            }
            fetch(url, postData)
                .then(res => res.json())
                .then(res => {
                    if (res.message === true)
                        pickemailerror("This Email is already existed");
                    else
                        pickemailerror("");
                })
        }
    }

    // Handle course checkbox change (multiple selection)
    const handleCourseChange = (e) => {
        const { value, checked } = e.target;
        pickcourse((prevSelectedCourses) => {
            if (checked) {
                // Add course if checked
                return [...prevSelectedCourses, value];
            } else {
                // Remove course if unchecked
                return prevSelectedCourses.filter(course => course !== value);
            }
        });
    };

    const save = (e) => {
        let c = 0;

        let nameValidationPattern = "^[a-zA-Z\\s]+$";
        let namevalidation = new RegExp(nameValidationPattern);
        if (!namevalidation.test(name))
            c = 1;

        let mpattern = /^[6789]\d{9}$/;
        if (!mpattern.test(mobile))
            c = 1;

        if (designation === "")
            c = 1;

        if (gender === "")
            c = 1;

        if (course.length === 0) // Check if at least one course is selected
            c = 1;

        if (image === null && photo === "")
            c = 1;

        if (c === 0) {
            const currentDate = new Date();
            const date = currentDate
                .toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).split('/').join('-');

            e.preventDefault(); // Prevent default form submission behavior

            // Create a new FormData instance and append form data
            const formData = new FormData();
            formData.append('name', name);
            formData.append('mobile', mobile);
            formData.append('email', email);
            formData.append('designation', designation);
            formData.append('gender', gender);
            formData.append('course', course.join(',')); // Send courses as a CSV string
            formData.append('date', date);
            if (image !== null) {
                formData.append('employeeimage', image); // Append the new file if provided
            } else if (photo) {
                formData.append('employeeimage', photo); // Keep the existing photo if not updated
            }

            // POST request for saving or updating the employee data
            if (employeeid === "") {
                // Add a new employee
                axios.post(`${apipath}/employee/saveemployee`, formData)
                    .then(res => {
                        toast.success("Employee Data Added Successfully");
                        window.location.reload();
                        getlist();
                    })
                    .catch(err => {
                        console.error("Error saving record:", err);
                        toast.error("Error saving record", err.message, "error");
                    });
            } else {
                // Update an existing employee
                formData.append('id', employeeid);
                axios.post(`${apipath}/employee/updateemployeedetails`, formData)
                    .then(res => {
                        toast.success("Employee Updated Successfully");
                        window.location.reload();
                        getlist();
                    })
                    .catch(err => {
                        console.error("Error saving record:", err);
                        toast.error("Error saving record", err.message, "error");
                    });
            }
        } else {
            toast.error("Please Enter the Fields Correctly");
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        pickimage(file);
    };

    const renderImage = () => {
        if (image) {
            const imageUrl = URL.createObjectURL(image);  // Create a URL for the selected file
            return <img src={imageUrl} alt="Employee" width="100" height="100" />;
        } else if (photo) {
            return <img src={`http://127.0.0.1:5500/employeedatabase/employeeimages/${photo}`} alt="Employee" width="100" height="100" />;
        }
        return null; // In case there is no image selected
    };

    const updatemployee = (id) => {
        let url = `${apipath}/employee/getemployeedetails`;
        let postData = {
            headers: { 'Content-Type': 'application/json' },
            method: "post",
            body: JSON.stringify({ id: id })
        }
        fetch(url, postData)
            .then(res => res.json())
            .then(res => {
                pickname(res.name);
                pickemail(res.email);
                pickmobile(res.mobile);
                pickdesignation(res.designation);
                pickgender(res.gender);
                pickemployeeid(res._id);
                pickphoto(res.image); // Set existing photo URL
                pickcourse(Array.isArray(res.course) ? res.course : res.course.split(','));
                pickbutton("Update");
            });
    }

    const deleteemployee = (id) => {
        let url = `${apipath}/employee/deleteemployee`;
        let postData = {
            headers: { 'Content-Type': 'application/json' },
            method: "post",
            body: JSON.stringify({ id: id })
        }
        fetch(url, postData)
            .then(res => res.json())
            .then(res => {
                console.log(res);
                toast.success(res.message);
                getlist();
            })
    }

    let [employeelist, pickemployeelist] = useState([]);
    const getlist = () => {
        fetch(`${apipath}/employee/getemployeelist`)
            .then(res => res.json())
            .then(res => {
                res.sort((a, b) => a.name.localeCompare(b.name));
                pickemployeelist(res);
            })
    }

    useEffect(() => { getlist(); }, []);

    if (localStorage.getItem("username") === null)
        return <Navigate to="/adminlogin" />

    return (
        <div className="container">
            <div className="row mt-4 mb-4">
                <h1 className="text-decoration-underline"> Employee List </h1>
                <h4 className="text-end col-12"> Total Count : {employeelist.length}  <button className="btn btn-success ms-5" data-bs-toggle="modal" data-bs-target="#myModal"> Create Employee </button> </h4>
                <h5 className="text-end col-sm-5 ms-auto mt-3">
                    <div className="input-group">
                        <i className="fa fa-search bg-warning input-group-text"></i>
                        <input type="text" className="form-control shadow-none" placeholder="Enter Search Keyword ..." onChange={obj => picksearchkey(obj.target.value)} value={searchkey} />
                    </div>
                </h5>
                <div className="col-sm-12 m-auto mt-4">
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th> ID </th>
                                    <th> Image </th>
                                    <th> Name </th>
                                    <th> Email </th>
                                    <th> Mobile No </th>
                                    <th> Designation </th>
                                    <th> Gender </th>
                                    <th> Course </th>
                                    <th> Date </th>
                                    <th> Action </th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    employeelist.map((employee, index) => {
                                        if (employee.name.toLowerCase().match(searchkey.toLowerCase()) || employee.email.toLowerCase().match(searchkey.toLowerCase()) || employee.mobile.toString().match(searchkey) || employee.gender.toLowerCase().match(searchkey.toLowerCase()))
                                            return (
                                                <tr key={index}>
                                                    <td> {employee._id} </td>
                                                    <td> <img src={`http://127.0.0.1:5500/employeedatabase/employeeimages/${employee.image}`} width="60" height="60" /></td>
                                                    <td> {employee.name} </td>
                                                    <td> {employee.email} </td>
                                                    <td> {employee.mobile} </td>
                                                    <td> {employee.designation} </td>
                                                    <td> {employee.gender} </td>
                                                    <td> {employee.course} </td>
                                                    <td> {employee.date} </td>
                                                    <td>
                                                        <div className="row">
                                                            <div className="col-6"> <i onClick={updatemployee.bind(this, employee._id)} data-bs-toggle="modal" data-bs-target="#myModal" className="fa fa-edit text-primary ms-auto"></i> </div>
                                                            <div className="col-6"> <i onClick={deleteemployee.bind(this, employee._id)} className="fa fa-trash text-danger ms-auto"> </i> </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="modal" id="myModal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title text-center text-primary"> <i className="fa fa-user-plus"></i> Add Employee </h3>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={save} encType='multipart/form-data'>
                                <div className="card border-0 p-2">
                                    <div className="card-body">
                                        <div className="row mb-4">
                                            <h6> Name </h6>
                                            <input type="text" className="form-control" onChange={obj => pickname(obj.target.value)} value={name} />
                                        </div>
                                        <div className="row mb-4">
                                            <h6> E-mail Id </h6>
                                            <input type="email" className="form-control" onChange={obj => { pickemail(obj.target.value); checkemail(obj.target.value); }} value={email} />
                                            <i className="text-danger"> {emailerror} </i>
                                        </div>
                                        <div className="row mb-4">
                                            <h6> Mobile No </h6>
                                            <input type="number" className="form-control" onChange={obj => pickmobile(obj.target.value)} value={mobile} />
                                        </div>
                                        <div className="row mb-4">
                                            <h6> Designation </h6>
                                            <select type="text" className="form-select" onChange={obj => pickdesignation(obj.target.value)} value={designation}>
                                                <option> Choose Designation </option>
                                                <option> HR </option>
                                                <option> Manager </option>
                                                <option> Sales </option>
                                            </select>
                                        </div>
                                        <div className="row mb-4">
                                            <h6> Gender </h6>
                                            <div className="row">
                                                <div className="col-sm-5">
                                                    <div class="form-check">
                                                        <input type="radio" id="male" class="form-check-input" onChange={obj => pickgender(obj.target.value)} value="male" name="gender" checked={gender === "male"} />
                                                        <label for="male"> Male </label>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6">
                                                    <div class="form-check">
                                                        <input type="radio" id="female" class="form-check-input" onChange={obj => pickgender(obj.target.value)} value="female" name="gender" checked={gender === "female"} />
                                                        <label for="female"> Female </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-4">
                                            <h6> Course </h6>
                                            <div className="row">
                                                <div className="col-sm-4">
                                                    <div class="form-check">
                                                        <input type="checkbox" class="form-check-input" value="MCA" onChange={handleCourseChange} checked={course.includes("MCA")} />
                                                        MCA
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div class="form-check">
                                                        <input type="checkbox" class="form-check-input" value="BCA" onChange={handleCourseChange} checked={course.includes("BCA")} />
                                                        BCA
                                                    </div>
                                                </div>
                                                <div className="col-sm-4">
                                                    <div class="form-check">
                                                        <input type="checkbox" class="form-check-input" value="BSC" onChange={handleCourseChange} checked={course.includes("BSC")} />
                                                        BSC
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row mb-4">
                                            <h6> Image upload </h6>
                                            <input type="file" accept=".png, .jpg, .jpeg" className="form-control" onChange={handleFileChange} />
                                            {renderImage()}
                                            {image === null && <i className="text-danger"> Upload the image  </i>}
                                        </div>
                                        <div className="mt-3">
                                            <button type="submit" className="btn btn-primary form-control" data-bs-dismiss="modal"> {button} </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Employeedetails;

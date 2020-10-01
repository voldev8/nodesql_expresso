const express = require('express');
const sqlite3 = require('sqlite3');


const employeesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');

// GET, PUT, and DELETE route paths will have an :employeeId parameter. check if ID exists and if not send a 404 response.
employeesRouter.param('employeeId', (req, res, next, employeeId) => {
  const sql = `SELECT * FROM Employee WHERE id=$employeeId`;
  const values = {$employeeId: employeeId}
  db.get(sql, values, (err, employee)=>{
    if (err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  })
});

//needs to be below param so it can grab it
employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

// GET
// Returns a 200 response containing all saved currently-employed employees (is_current_employee is equal to 1) on the employees property of the response body

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE Employee.is_current_employee=1', (err, employees) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ employees });
    }
  });
})

// GET
// Returns a 200 response containing the employee with the supplied employee ID on the employee property of the response body
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({ employee: req.employee });
})

// POST
// Creates a new employee with the information from the employee property of the request body and saves it to the database. Returns a 201 response with the newly-created employee on the employee property of the response body
// If any required fields are missing, returns a 400 response
employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  let isCurrentEmployee = req.body.isCurrentEmployee;

  if(!name || !position || !wage) {
    return res.sendStatus(400);
  }
  if(isCurrentEmployee !== 0) {
    isCurrentEmployee = 1;
  }

  const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };

  db.run(sql, values, function(error) {
    if(error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`,
      (error, employee) => {
        res.status(201).json({ employee });
      });
    }
  });
})

// PUT
// Updates the employee with the specified employee ID using the information from the employee property of the request body and saves it to the database. Returns a 200 response with the updated employee on the employee property of the response body
// If any required fields are missing, returns a 400 response
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  let isCurrentEmployee = req.body.isCurrentEmployee;

  if(!name || !position || !wage) {
    return res.sendStatus(400);
  }
  if(isCurrentEmployee !== 0) {
    isCurrentEmployee = 1;
  }

  const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE Employee.id = $employeeId';
  const values = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee,
    $employeeId: req.params.employeeId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
      (error, employee) => {
        res.status(200).json({ employee });
      });
    }
  });
})

// DELETE
// Updates the employee with the specified employee ID to be unemployed (is_current_employee equal to 0). Returns a 200 response.
// If an employee with the supplied employee ID doesn’t exist, returns a 404 response
employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
  const values = { $employeeId: req.params.employeeId }
  db.run(sql, values, (error) => {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`,
      (error, employee) => {
        res.status(200).json({ employee });
      });
    }
  });
})

module.exports = employeesRouter;


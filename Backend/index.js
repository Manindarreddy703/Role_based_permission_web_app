const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());

// Middleware
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "Root@123",
  database: "taskmanager",
});

db.connect((err) => {
  if (err) throw err;
  // console.log(db);
  console.log("Connected to MySQL");
});

require("dotenv").config();

const jwtSecret = "Manindar-reddy";

// Example JWT creation
// Login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Check if the user exists
  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    // Compare password with bcrypt
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, firstname: user.firstname },
        jwtSecret,
        { expiresIn: "1h" }
      );

      // Return token
      res.json({ token });
    });
  });
});

app.post("/api/register", (req, res) => {
  const { firstname, lastname, email, password, confirmPassword, role } =
    req.body;

  // Validate if passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Check if user already exists
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";
  db.query(checkUserQuery, [email], (err, results) => {
    if (err) throw err;

    if (results.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) throw err;

      // Insert the new user into the database
      const insertUserQuery =
        "INSERT INTO users (firstname, lastname, email, password,role) VALUES (?, ?, ?, ?,?)";
      db.query(
        insertUserQuery,
        [firstname, lastname, email, hashedPassword, role],
        (err, result) => {
          if (err) throw err;

          // Generate JWT after successful registration
          const userId = result.insertId;
          const token = jwt.sign({ id: userId }, jwtSecret, {
            expiresIn: "1h",
          });

          // Return token to the client
          res.json({ token });
        }
      );
    });
  });
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"

  if (!token) {
    return res.status(403).json({ message: "Malformed token" });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: "Failed to authenticate token" });
    }

    req.user = decoded; // Store decoded token info (user) in req.user
    next();
  });
};

// Protected route example
// Get all todos
app.get("/api/todos", verifyToken, (req, res) => {
  const userId = req.user.id; // Access the user ID from the token
  console.log("userId", userId);
  db.query(
    "SELECT * FROM todos WHERE created_by_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json(results);
    }
  );
});
app.post("/api/todos", verifyToken, (req, res) => {
  const { title } = req.body;
  const userId = req.user.id; // Get user ID from the verified token

  // SQL query to insert a new todo
  const sql = "INSERT INTO todos (title, created_by_id) VALUES (?, ?)";

  // Execute the query
  db.query(sql, [title, userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Return the newly created todo as a response
    res
      .status(201)
      .json({ id: results.insertId, title: title, createdBy: userId });
  });
});

app.delete("/api/todos/:id", verifyToken, (req, res) => {
  const todoId = req.params.id;
  console.error(todoId, "aaaaaaaaaaaa");
  // SQL query to delete the todo
  const sql = "DELETE FROM todos WHERE id = ?";

  // Execute the query
  db.query(sql, [todoId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted" });
  });
});

app.put("/api/todos/:id", verifyToken, (req, res) => {
  const todoId = req.params.id;
  const { title } = req.body;

  // SQL query to update the todo
  const sql = "UPDATE todos SET title = ? WHERE id = ?";

  // Execute the query
  db.query(sql, [title, todoId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Return the updated todo as a response (optional, based on your needs)
    res.json({ id: todoId, title: title });
  });
});

app.get("/api/permissions", verifyToken, (req, res) => {
  const userId = req.user.id; // Access the user ID from the token
  console.log("userId", userId);
  db.query(
    "SELECT * FROM permissions WHERE created_by_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json(results);
    }
  );
});
app.post("/api/permissions", verifyToken, (req, res) => {
  const { title } = req.body;
  const userId = req.user.id; // Get user ID from the verified token

  // SQL query to insert a new todo
  const sql = "INSERT INTO permissions (title, created_by_id) VALUES (?, ?)";

  // Execute the query
  db.query(sql, [title, userId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Return the newly created todo as a response
    res
      .status(201)
      .json({ id: results.insertId, title: title, createdBy: userId });
  });
});

app.delete("/api/permissions/:id", verifyToken, (req, res) => {
  const permissionsId = req.params.id;
  console.error(todoId, "aaaaaaaaaaaa");
  // SQL query to delete the todo
  const sql = "DELETE FROM permissions WHERE id = ?";

  // Execute the query
  db.query(sql, [permissionsId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "permissions not found" });
    }

    res.json({ message: "permissions deleted" });
  });
});

app.put("/api/permissions/:id", verifyToken, (req, res) => {
  const permissionsId = req.params.id;
  const { title } = req.body;

  // SQL query to update the todo
  const sql = "UPDATE todos SET title = ? WHERE id = ?";

  // Execute the query
  db.query(sql, [title, permissionsId], (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Return the updated todo as a response (optional, based on your needs)
    res.json({ id: todoId, title: title });
  });
});

app.get("/api/permission-list", verifyToken, (req, res) => {
  // Access the user ID from the token
  const userId = req.user.id; // Assuming 'verifyToken' middleware attaches 'user' object to req

  // Query to fetch permissions from the database
  db.query("SELECT * FROM permissions", (err, results) => {
    if (err) {
      // Return a 500 error with a meaningful message if something goes wrong
      return res
        .status(500)
        .json({ error: "Error fetching permissions", details: err });
    }
    // Return the fetched results as JSON
    res.json(results);
  });
});

app.post("/api/create-permission", verifyToken, (req, res) => {
  // const { role, title } = req.body; // Ensure title is sent as an array if JSON

  const { role, permissions } = req.body; // Extract `permissions` instead of `title`

  // Validate `permissions` is an array
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return res
      .status(400)
      .json({ message: "Permissions must be a non-empty array." });
  }

  const userId = req.user.id; // Get user ID from the verified token

  // SQL query to insert a new role with permissions
  const sql = "INSERT INTO rolepermission (role, permissions) VALUES (?, ?)";

  // Convert the title array to JSON string for storage
  const titleJSON = JSON.stringify(permissions);

  // Execute the query
  db.query(sql, [role, titleJSON], (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json({
      id: results.insertId,
      role,
      permissions,
    });
  });
});

app.get("/api/getuserdetails/:id", verifyToken, (req, res) => {
  const UserId = req.params.id;

  db.query("SELECT * FROM users WHERE id = ?", [UserId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.json(results);
  });
});
app.get("/api/list/:role", verifyToken, (req, res) => {
  const Userrole = req.params.role;
  console.log(req.params);
  db.query(
    "SELECT * FROM rolepermission WHERE role = ?",
    [Userrole],
    (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.json(results);
    }
  );
});
app.get("/api/all-permissions", verifyToken, (req, res) => {
  db.query("SELECT * FROM rolepermission", (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.json(results);
  });
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

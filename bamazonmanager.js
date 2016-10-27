// MODULES:
var db = require("mysql");
var inquirer = require("inquirer");
var config = require("./config.js")
var queries = require("./queries.js")


// Creating a connection to the database
var connection = db.createConnection({

	host: config.host,
	port: config.port,
	user: config.user,
	password: config.password,
	database: config.database

})

function managerMenu(connection) {
   
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
    
    }).then(function(answer) {
        switch(answer.action) {
            case 'View Products for Sale':
                productDisplay(connection, managerMenu);
            break;
            
            case 'View Low Inventory':
                lowInventory(connection, managerMenu);
            break;
            
            case 'Add to Inventory':
                updateQuantity(connection, managerMenu);
            break;
            
            case 'Add New Product':
                addProduct(connection, managerMenu);
            break;

            default: 
            	'Something went wrong!';
            break;
        }
    })
};


// Displays all available inventory
function productDisplay(conn, callback) {

	conn.query(queries.displayTable, function(err, res) {

		if (err) throw error;
	   
	    for (var i = 0; i < res.length; i++) {
	    	console.log(res[i].item_id + " | " + res[i].product_name + " | Dept: " + res[i].department_name + " | $" + res[i].price + " | Qty: " + res[i].stock_quantity);
	    }

	    if (typeof callback === 'function') {
	    	callback();
	    }
	})
}


// Displays all inventory items with stock quantity lower than 5
function lowInventory(conn, callback) {

	conn.query(queries.lowInventory, function(err, res) {
	
		if (err) throw error;
	   
	    for (var i = 0; i < res.length; i++) {
	    	console.log(res[i].item_id + " | " + res[i].product_name + " | Dept: " + res[i].department_name + " | $" + res[i].price + " | Qty: " + res[i].stock_quantity);
	    }

	    if (typeof callback === 'function') {
	    	callback();
	    }
	})
}


// Prompt that allows the manager to add more of any item currently in the store.
function updateQuantity() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Enter the product ID for the item you would like to update. ",
        validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        name: "quantity",
        type: "input",
        message: "How many units of the product need to be added? ",
        validate: function(value) {
            if (isNaN(value) == false) {
                return true;
            } else {
                return false;
            }
        }
    }]).then(function(answer) {

        connection.query(queries.selectItemId, [answer.id], function(err, res) {

        	// Setting variables to have the values of the changing stock quantities
            var quantity = res[0].stock_quantity;
            var newQuantity = parseInt(quantity) + parseInt(answer.quantity);

        	connection.query(queries.updateStock, [parseInt(newQuantity), answer.id], function(err, res) {
        		        		
        		console.log("Thank you for updating this product. ")


        	})
            
        })
    })
};

// Allows manager to add completely new product to the store.
function addProduct(conn, callback) {
    inquirer.prompt([{
        name: "name",
        type: "input",
        message: "Product Name: ",
    }, {
        name: "dept",
        type: "input",
        message: "Dept Name: ",
    }, {
        name: "price",
        type: "input",
        message: "Price: ",
    }, {
        name: "quantity",
        type: "input",
        message: "Stock Qty: ",
        
    }]).then(function(answer) {

        conn.query(queries.addProduct, [answer.name, answer.dept, answer.price, answer.quantity], function(err, res) {

        	if(err) throw err;

        	console.log('This product has now been added to the inventory.');

        	if(typeof callback === 'function') {
        		callback();
        	}
            
        })
    })
};

connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);

	managerMenu(connection);

})





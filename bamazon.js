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


// Display all items available for sale
function displayItems(conn, callback) {

	conn.query(queries.displayTable, function(err, res) {

		if (err) throw error;
	   
	    for (var i = 0; i < res.length; i++) {
	    	console.log(res[i].item_id + " | " + res[i].product_name + " | $" + res[i].price);
	    }

	    if(typeof callback === 'function') {
	    	callback();
	    }
	})
}


// Prompts customer for product ID and quantity of item they want to purchase. 
function customerPurchase() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Enter the product ID for the item you would like to buy. ",
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
        message: "How many units of the product would you like to purchase? ",
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
            var newQuantity = quantity - answer.quantity;

            // Variable containing the value of the overall cost of the purchase
            var totalCost = res[0].price * answer.quantity;

            // If the customer's requested unit amounts cannot be fulfilled due to short stock, they are informed.
            if(newQuantity < 0) {

            	console.log("Insufficient stock for purchase!");

            } else {
            	connection.query(queries.updateStock, [newQuantity, answer.id], function(err, res) {
            		
            		console.log("TOTAL: $" + totalCost);
            		console.log("Thank you for shopping at Bamazon! Your order will ship momentarily.")

            	})
            }
        })
    })
};


connection.connect(function(err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);

	displayItems(connection, customerPurchase);

})











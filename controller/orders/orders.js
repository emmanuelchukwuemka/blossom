const db = require("../../Database/db");
const asyncHandler = require("express-async-handler");
const currentDate = require("../../utils/Date/currentDate");
const { sendEmail } = require("../../utils/sendEmail");

const placeOrderCart = asyncHandler(async (req, res) => {
  const date = currentDate();
  let emails = "";
  const {
    user_id,
    product_id,
    colors,
    sizes,
    shipping_address,
    payment_type,
    order_id,
    quantity,
    userEmail,
    paymentStatus,
  } = req.body;

  if (payment_type === "GiftCard") {
    const products = JSON.parse(product_id).filter((data) => data != 1);
    const payment_status = "paid";
    products.map((datax) => {
      const colorArray = JSON.parse(colors).filter(
        (data) => data.productID === datax
      );
      const sizeArray = JSON.parse(sizes).filter(
        (data) => data.productID === datax
      );
      const quantityArray = JSON.parse(quantity);
      const productID = datax;

      const productcolors = colorArray.map((data) => data.color).toString();
      const productsizes = sizeArray.map((data) => data.size).toString();
      const productquantity = quantityArray[datax];

      const selectSQL = `SELECT * from products WHERE id = \'${datax}\'`;

      db.query(selectSQL, (err, result) => {
        if (err) {
          console.error(err);
          res.send("Error Quering database").status(401);
        } else if (result.length != 0) {
          const product = result[0];
          const product_name = product.title;
          const images = product.images;
          const price = product.price;
          const sellerId = product.sellerId;
          const total = Number(productquantity) * Number(price);
          const productstyles = "no style";
          console.log(`seller id  = ${sellerId}`);

          // giftcard balance now in wallet table, old giftcards table is now for giftcards records
          //  const debitSQL = `SELECT * from GiftCards WHERE user_id = ${user_id}`
          const debitSQL = `SELECT * from wallet WHERE user_id = ${user_id}`;

          db.query(debitSQL, (error, result) => {
            if (error) {
              console.log(`Database Error` + error);
              res.status(500).send(`Database Error` + error);
            }

            const newBalance = Number(result[0].price) - Number(total);
            // const updateSQL = `UPDATE GiftCards SET price=\'${newBalance}\' WHERE user_id=${user_id}`;
            const updateSQL = `UPDATE wallet SET giftcard_balance=\'${newBalance}\' WHERE user_id=${user_id}`;

            db.query(updateSQL, (error, result) => {
              if (error) {
                console.log(`Database Error` + error);
                res.status(500).send(`Database Error` + error);
              }
              const SQL = `INSERT INTO orders(order_id,user_id,sellerId,product_id,product_name,images,price,quantity,total,shipping_address,payment_type,payment_status,date,colors,sizes,styles)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

              db.query(
                SQL,
                [
                  order_id,
                  sellerId,
                  user_id,
                  productID,
                  product_name,
                  images,
                  price,
                  productquantity,
                  total,
                  shipping_address,
                  payment_type,
                  payment_status,
                  date,
                  productcolors,
                  productsizes,
                  productstyles,
                ],
                (err, result) => {
                  if (err) {
                    console.error(err);
                  }

                  const SQL = `SELECT * FROM sellers WHERE id= \'${sellerId}\'`;

                  db.query(SQL, (error, result) => {
                    if (error) {
                      res.status(500).send(`Database Error` + error);
                    } else if (result.length != 0) {
                      const id = result[0].user_id;
                      const SQL = `SELECT * from Users WHERE id= \'${id}\'`;
                      console.log(`seller user_id  = ${id}`);

                      db.query(SQL, (error, result) => {
                        if (error) {
                          res.status(500).send(`Database Error` + error);
                        } else if (result.length != 0) {
                          const email = result[0].email;
                          emails = emails + email + ",";
                        }
                      });
                    }
                  });
                }
              );
            });
          });

          console.log("...........product.........");
          console.log(datax);
          console.log(product.title);
          console.log(productcolors);
          console.log(productsizes);
          console.log(productquantity);
          console.log("...........product.........");
        }
      });
    });

    setTimeout(() => {
      console.log(emails);

      const selectSQL = `SELECT * FROM orders WHERE order_id=\'${order_id}\'`;

      db.query(selectSQL, (err, result) => {
        if (err) {
        } else if (result.length != 0) {
          let message = `Your OrderX with order_id = ${order_id} was placed`;

          result.map((data) => {
            message =
              message +
              "\n" +
              "Item Name =" +
              data.product_name +
              "\n" +
              "price = " +
              "$" +
              data.price +
              "\n" +
              "quatity=" +
              data.quantity +
              "\n" +
              "total=" +
              "$" +
              data.price +
              "x" +
              data.quantity +
              "=" +
              data.total +
              "\n" +
              "colors=" +
              data.colors +
              "\n" +
              "sizes=" +
              data.sizes;
          });

          let data = {
            email: `${userEmail}`,
            subject: "Bloomzon Orders",
            text: message,
          };
          sendEmail(data);
          data = {
            email: "badareokiemute2014@gmail.com", //`${userEmail}`,
            subject: "Bloomzon Orders",
            text: message,
            html: `<p>HTML version of the message</p>`,
          };
          sendEmail(data);

          return res
            .status(202)
            .json({ message: "Account deleted successful", status: 1 });
        }
      });
    }, 5000);
  } else {
    const products = JSON.parse(product_id).filter((data) => data != 1);
    console.log("ProductID" + products);
    const payment_status = paymentStatus;
    products.map((datax) => {
      const colorArray = JSON.parse(colors).filter(
        (data) => data.productID === datax
      );
      const sizeArray = JSON.parse(sizes).filter(
        (data) => data.productID === datax
      );
      const quantityArray = JSON.parse(quantity);
      const productID = datax;

      const productcolors = colorArray.map((data) => data.color).toString();
      const productsizes = sizeArray.map((data) => data.size).toString();
      const productquantity = quantityArray[datax];

      const selectSQL = `SELECT * from products WHERE id = \'${datax}\'`;

      db.query(selectSQL, (err, result) => {
        if (err) {
          console.error(err);
          res.send("Error Quering database").status(401);
        } else if (result.length != 0) {
          const product = result[0];
          const product_name = product.title;
          const images = product.images;
          const price = product.price;
          const sellerId = product.sellerId;
          const total = Number(productquantity) * Number(price);
          const productstyles = "no style";
          console.log(`seller id  = ${sellerId}`);
          const SQL = `INSERT INTO orders(order_id,sellerId,user_id,product_id,product_name,images,price,quantity,total,shipping_address,payment_type,payment_status,date,colors,sizes,styles)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
          db.query(
            SQL,
            [
              order_id,
              sellerId,
              user_id,
              productID,
              product_name,
              images,
              price,
              productquantity,
              total,
              shipping_address,
              payment_type,
              payment_status,
              date,
              productcolors,
              productsizes,
              productstyles,
            ],
            (err, result) => {
              if (err) {
                console.error(err);
              }

              const SQL = `SELECT * FROM sellers WHERE id= \'${sellerId}\'`;

              db.query(SQL, (error, result) => {
                if (error) {
                  res.status(500).send(`Database Error` + error);
                } else if (result.length != 0) {
                  const id = result[0].user_id;
                  const SQL = `SELECT * from Users WHERE id= \'${id}\'`;
                  console.log(`seller user_id  = ${id}`);

                  db.query(SQL, (error, result) => {
                    if (error) {
                      res.status(500).send(`Database Error` + error);
                    } else if (result.length != 0) {
                      const email = result[0].email;
                      emails = emails + email + ",";
                    }
                  });
                }
              });
            }
          );

          console.log("...........product.........");
          console.log(datax);
          console.log(product.title);
          console.log(productcolors);
          console.log(productsizes);
          console.log(productquantity);
          console.log("...........product.........");
        }
      });
    });

    setTimeout(() => {
      console.log(emails);

      const selectSQL = `SELECT * FROM orders WHERE order_id=\'${order_id}\'`;

      db.query(selectSQL, (err, result) => {
        if (err) {
        } else if (result.length != 0) {
          let message = `Your OrderX with order_id = ${order_id} was placed`;

          result.map((data) => {
            message =
              message +
              "\n" +
              "Item Name =" +
              data.product_name +
              "\n" +
              "price = " +
              "$" +
              data.price +
              "\n" +
              "quatity=" +
              data.quantity +
              "\n" +
              "total=" +
              "$" +
              data.price +
              "x" +
              data.quantity +
              "=" +
              data.total +
              "\n" +
              "colors=" +
              data.colors +
              "\n" +
              "sizes=" +
              data.sizes;
          });

          let data = {
            email: `${userEmail}`,
            subject: "Bloomzon Orders",
            text: message,
          };
          sendEmail(data);
          data = {
            email: "badareokiemute2014@gmail.com", //`${userEmail}`,
            subject: "Bloomzon Orders",
            text: message,
            html: `<!doctype html>
                   <html >
                     <head>
                       <meta charset="utf-8">
                       <style>
                             p{
                                color:white;
                             }
                       </style>
                       </head>
                     <body>
                       <p>Image: <img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
                       <p>GIF</p>
                     </body>
                   </html>`,
          };
          sendEmail(data);

          return res
            .status(202)
            .json({ message: "Account deleted successful", status: 1 });
        }
      });
    }, 5000);
  }
});

const orders = asyncHandler(async (req, res) => {
  const { userID, AdminOrders } = req.body;
  if (!userID || !AdminOrders) {
    return res
      .status(400)
      .json({ message: "userID and AdminOrders are required" });
  }

  if (AdminOrders === "yes") {
    // Query to check if the user is an admin in the Staff table
    const checkAdminSQL = `SELECT * from Users WHERE id = ? AND user_type = 'staff'`;
    db.query(checkAdminSQL, [userID], (error, adminResult) => {
      if (error) {
        console.error("Error checking admin status:", error);
        return res
          .status(500)
          .json({ message: "Error querying database for admin status" });
      }
      if (adminResult.length > 0) {
        // User is an admin, fetch all orders
        console.log("User is admin, fetching all orders");
        const getAllOrdersSQL = `SELECT * FROM orders ORDER BY id DESC`;
        db.query(getAllOrdersSQL, (error, allOrdersData) => {
          if (error) {
            console.error("Error fetching all orders:", error);
            return res
              .status(500)
              .json({ message: "Error fetching all orders" });
          }
          return res.status(200).json({
            message: "all orders fetched by admin",
            data: allOrdersData.length > 0 ? allOrdersData : [],
          });
        });
      } else {
        return res
          .status(403)
          .json({ message: "Access denied. Not an admin." });
      }
    });
  } else {
    // For regular users or sellers
    console.log("Fetching orders for regular user");
    const getSellerOrdersSQL = `SELECT * FROM orders WHERE user_id = ?`;
    db.query(getSellerOrdersSQL, [userID], (error, sellerOrdersData) => {
      if (error) {
        console.error("Error fetching seller orders:", error);
        return res
          .status(500)
          .json({ message: "Error fetching seller orders" });
      }
      if (sellerOrdersData.length > 0) {
        return res.status(200).json({
          message: "user orders fetched successfully",
          data: sellerOrdersData,
        });
      } else {
        return res.status(200).json({
          message: "user orders fetched successfully",
          data: [],
        });
      }
    });
  }
});

const searchOrders = asyncHandler(async (req, res) => {
  const { userID, AdminOrders, order_id } = req.body;
  if (AdminOrders === "yes") {
    console.log("A");
    const SQL = `SELECT * FROM Staff WHERE staff_id=${userID}`;
    db.query(SQL, (error, result) => {
      if (error) {
        console.error(error);
        res.send("Error Quering database").status(401);
      } else if (result.length != 0) {
        //if user is an admin user

        const SQL = `SELECT * FROM orders  WHERE order_id = ${order_id}`;

        db.query(SQL, (error, data) => {
          if (error) {
            console.error(error);
            res.send("Error Quering database").status(401);
          } else if (data.length != 0) {
            res.send(data).status(201);
          } else {
            res.send(data).status(201);
          }
        });
      } else {
        const SQL = `SELECT * FROM orders WHERE  sellerId=${userID} AND order_id=${order_id}`;

        db.query(SQL, (error, data) => {
          if (error) {
            console.error(error);
            res.send("Error Quering database").status(401);
          } else if (data.length != 0) {
            res.send(data).status(201);
          } else {
            res.send(data).status(201);
          }
        });
      }
    });
  } else {
    console.log("B");
    const SQL = `SELECT * FROM orders WHERE user_id=${userID} AND order_id=${order_id}`;

    db.query(SQL, (error, data) => {
      if (error) {
        console.error(error);
        res.send("Error Quering database").status(401);
      } else if (data.length != 0) {
        res.send(data).status(201);
      } else {
        res.send(data).status(201);
      }
    });
  }
});

const placeOrder = asyncHandler(async (req, res) => {
  const date = currentDate();
  const {
    user_id,
    sellerId,
    order_id,
    product_id,
    product_name,
    images,
    price,
    colors,
    sizes,
    styles,
    quantity,
    total,
    shipping_address,
    payment_type,
    payment_status,
  } = req.body;

  if (payment_type === "GiftCard") {
    // giftcard balance had been moved to user wallet, old giftcards table is now for giftcards records
    // const debitSQL = `SELECT * from GiftCards WHERE user_id = ${user_id}`;
    const debitSQL = `SELECT * from wallet WHERE user_id = ${user_id}`;

    db.query(debitSQL, (error, result) => {
      if (error) {
        console.log(`Database Error` + error);
        res.status(500).send(`Database Error` + error);
      }

      const newBalance = Number(result[0].price) - Number(total);
      // const updateSQL = `UPDATE GiftCards SET price=\'${newBalance}\' WHERE user_id=${user_id}`;
      const updateSQL = `UPDATE wallet SET giftcard_balance=\'${newBalance}\' WHERE user_id=${user_id}`;

      db.query(updateSQL, (error, result) => {
        if (error) {
          console.log(`Database Error` + error);
          res.status(500).send(`Database Error` + error);
        }

        const SQL = `INSERT INTO orders (user_id,order_id,sellerId,product_id,product_name,images,price,quantity,total,shipping_address,payment_type,payment_status,date,colors,sizes,styles)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        db.query(
          SQL,
          [
            user_id,
            order_id,
            sellerId,
            product_id,
            product_name,
            images,
            price,
            quantity,
            total,
            shipping_address,
            payment_type,
            payment_status,
            date,
            colors,
            sizes,
            styles,
          ],
          (err, data) => {
            if (err) {
              console.error(err);
              res.send("Error Quering database").status(401);
            } else if (data.length != 0) {
              console.log(data);
              res.json({ status: "201" }).status(201);
            } else {
              res.send(data).status(201);
            }
          }
        );
      });
    });
  } else if (payment_type === "paystack") {
    const SQL = `INSERT INTO orders (user_id,order_id,sellerId,product_id,product_name,images,price,quantity,total,shipping_address,payment_type,payment_status,date,colors,sizes,styles)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

    db.query(
      SQL,
      [
        user_id,
        order_id,
        sellerId,
        product_id,
        product_name,
        images,
        price,
        quantity,
        total,
        shipping_address,
        payment_type,
        payment_status,
        date,
        colors,
        sizes,
        styles,
      ],
      (err, data) => {
        if (err) {
          console.error(err);
          res.send("Error Quering database").status(401);
        } else if (data.length != 0) {
          console.log(data);
          res.send(data).status(201);
        } else {
          res.send(data).status(201);
        }
      }
    );
  }
});

const buyAgain = asyncHandler(async (req, res) => {
  const { userID } = req.body;

  const SQL = `SELECT * FROM products INNER JOIN orders ON orders.product_id=products.id AND orders.user_id = ${userID}`;

  db.query(SQL, (error, data) => {
    if (error) {
      console.error(error);
      res.send("Error Quering database").status(401);
    } else if (data.length != 0) {
      res.send(data).status(201);
    } else {
      res.send(data).status(201);
    }
  });
});

const orderDetails = asyncHandler(async (req, res) => {
  const { order_id, userID, sellerId } = req.body;
  let order = [];
  let user = [];
  let seller = [];

  const SQL = `SELECT * FROM orders WHERE order_id = ${order_id}`;

  db.query(SQL, (error, data) => {
    if (error) {
      console.error(error);
      res.send("Error Quering database").status(401);
    } else if (data.length != 0) {
      order = data;
    }
    const SQL = `SELECT * from Users WHERE id=${userID}`;
    db.query(SQL, (error, data) => {
      if (error) {
        console.error(error);
        res.send("Error Quering database").status(401);
      } else if (data.length != 0) {
        user = data;
      }
      const SQL = `SELECT * FROM shops WHERE user_id=${userID}`;
      db.query(SQL, (error, data) => {
        if (error) {
          console.error(error);
          res.send("Error Quering database").status(401);
        } else if (data.length != 0) {
          seller = data;
          res.status(201).json({ user: user, order: order, seller: seller });
        } else {
          res.status(201).json({ user: user, order: order, seller: seller });
        }
      });
    });
  });
});

module.exports = {
  orderDetails,
  searchOrders,
  orders,
  placeOrder,
  buyAgain,
  placeOrderCart,
};

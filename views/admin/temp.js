const checkout = async (req, res) => {
    try {
      console.log(req.body);
      const userId = req.session.user_id;
      const user = await User.findById(req.session.user_id);
      const cart = await User.findById(req.session.user_id, { cart: 1, _id: 0 });
      const coupon = await Coupon.findOne({
        $and: [
          { couponName: req.body.couponName },
          { users: { $nin: [req.session.user_id] } },
        ],
      });
      const walletResult = await User.aggregate([
        {
          $match: { _id: user._id }, // Match the user by _id
        },
        {
          $unwind: "$wallet", // Unwind the 'wallet' array to work with individual transactions
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$wallet.amount" }, // Calculate the sum of 'amount' values
          },
        },
      ]).exec();
  
      let walletBalance;
  
      if (walletResult && walletResult.length > 0) {
        walletBalance = walletResult[0].totalAmount.toLocaleString("en-IN", {
          style: "currency",
          currency: "INR", // You can change 'USD' to 'INR' for Indian Rupees
        });
        console.log("Total Amount in Wallet:", walletBalance);
      } else {
        console.log("No wallet transactions found.");
      }
  
      req.session.returnTo1 = "/checkout";
  
      console.log("walletout", walletBalance);
  
      let discount = 0;
      let newTotal = req.body.total;
      let total = 0;
  
      if (req.body.couponName) {
        console.log("coupon present");
        console.log(coupon);
        if (parseInt(coupon.minAmt) <= parseInt(req.body.total)) {
          console.log("if");
          const discountedAmt = (req.body.total * coupon.discount) / 100;
          console.log("discountedAmt");
          console.log(discountedAmt);
          console.log(discountedAmt < coupon.maxDiscount);
          if (discountedAmt < coupon.maxDiscount) {
            discount = discountedAmt;
          } else {
            discount = coupon.maxDiscount;
          }
          console.log("coupon.minAmt<total");
          console.log(discount);
          newTotal = req.body.total - discount;
  
          console.log("newTotal");
          console.log(newTotal);
        }
      } else if (!req.body.couponName) {
        console.log("no coupon used");
      }
  
      if (newTotal) {
        console.log("total if");
        total = newTotal;
      } else {
        console.log("total else");
  
        total = req.body.total;
      }
      // console.log(cart.cart);
      console.log(req.body);
      const order = new Order({
        customerId: userId,
        quantity: req.body.quantity,
        price: req.body.salePrice,
        products: cart.cart,
        coupon: req.body.couponName,
        discount: discount,
        totalAmount: total,
        shippingAddress: JSON.parse(req.body.address),
        paymentDetails: req.body.payment_option,
      });
      const orderSuccess = await order.save();
      // console.log('order==',order);
      // console.log('order');
      // console.log(order._id);
      const orderId = order._id;
      // console.log(orderSuccess);
      console.log(orderId);
  
      if (orderSuccess) {
        // Make the cart empty
        await User.updateOne({ _id: userId }, { $unset: { cart: 1 } });
  
        if (order.paymentDetails === "COD") {
          await Order.updateOne(
            { _id: new mongoose.Types.ObjectId(orderId) },
            { $set: { orderStatus: "PLACED" } }
          );
          for (const cartItem of user.cart) {
            const product = await Product.findById(cartItem.productId);
    
            if (product) {
              product.quantity -= cartItem.quantity;
              await product.save();
              console.log("quantity decreased");
            }
          }
    
          res.status(200).json({
            status: true,
            msg: "Order created for COD",
            orderId: orderId
          });
        } else if (req.body.payment_option === "razorpay") {
          console.log("razorpay");
  
          const amount = total * 100;
          const options = {
            amount: amount,
            currency: "INR",
            receipt: String(orderId),
          };
  
          for (const cartItem of user.cart) {
            const product = await Product.findById(cartItem.productId);
    
            if (product) {
              product.quantity -= cartItem.quantity;
              await product.save();
              console.log("quantity decreased");
            }
          }
  
          // Create a Razorpay order
          razorpay.orders.create(options, (err, order) => {
            if (!err) {
              console.log("Razorpay order created");
              console.log(orderId);
              
  
              // Send Razorpay response to the client
              res.status(200).send({
                success: true,
                msg: "Order created",
                order_id: order.id,
                amount: amount,
                reciept: orderId,
                key_id: "rzp_test_7ETyzh4jBTZxal",
                contact: "9876543210",
                name: "admin",
                email: "admin@gmail.com",
                orderId: orderId
              });
            } else {
              console.error("Razorpay order creation failed:", err);
              res
                .status(400)
                .send({ success: false, msg: "Something went wrong!" });
            }
          });
        }else if(req.body.payment_option === "WALLET"){
          console.log(walletResult[0].totalAmount);
          console.log(order.totalAmount);
          if(walletResult[0].totalAmount<order.totalAmount){
            console.log('if');
            res.status(200).json({
              lowWalletBalance: true,
              message: 'bill amount exceed wallet balance'
            })
          }else{
            console.log('else');
            let transaction = {
              orderId: orderId,
              amount: -order.totalAmount,
              transactionType: "DEBIT",
              remarks: "CHECKOUT",
            };
        
            user.wallet.push(transaction);
            await user.save();
            
            await Order.updateOne(
              { _id: new mongoose.Types.ObjectId(orderId) },
              { $set: {
                orderStatus: "PLACED",
                paymentStatus: "RECIEVED" } }
            );
            for (const cartItem of user.cart) {
              const product = await Product.findById(cartItem.productId);
      
              if (product) {
                product.quantity -= cartItem.quantity;
                await product.save();
                console.log("quantity decreased");
              }
            }
  
            res.status(200).json({
              status: true,
              msg: 'order created using wallet',
              orderId: orderId
            })
  
          }
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  };
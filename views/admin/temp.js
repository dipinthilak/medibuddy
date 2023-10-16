

onclick="return confirm('This action is going to delete <%= categories[i].name %> ')"

<table class="table table-hover" id="dataTable">
<thead>
    <tr>
        <th class="text-center">Name</th>
        <th class="text-center">Name</th>
        <th class="text-center">Description</th>
        <th class="text-center">isListed</th>
        <th class="text-center">Image</th>
        <th class="text-end">Action</th>
    </tr>
</thead>
<tbody>
    <% for(var i=0;i<category.length;i++){ %>
        <tr>
          <td><%= i+1 %></td>
          <td><%= category[i].name %></td>
          <td><%= category[i].description %></td>
          <td><%= category[i].isListed %></td>
          <td><img src="/admin-assets/category/<%= category[i].filename %>" class="img-sm img-thumbnail"  alt="check"></td>

          <td> <div class="d-flex">
            <a href="/admin/admincategoriesUpdate?id=<%= category[i]._id%>" class="btn-sm btn-info me-auto">Edit</a> <a type="button"  href="/admin/admincategoriesDelete?id/<%= category[i]._id %>" class="btn-sm btn-danger">Delete</a></div>
        </tr>
        <% } %>
    
</tbody>
</table>


const deleteCategory = async (req, res) => {
    try{
      const categoryId = req.query.id;
      console.log("******************"+categoryId);
      const catimg=await Category.findOne({_id:categoryId},{filename:1})
      const catrem=await Category.deleteOne({_id:categoryId});
      if(catrem)
      {
          //image removal
          fs.unlink(
            `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/category/${catimg}`,
            (err) => {
              if (err) {
                console.log(err);
              } else {
                console.log("File deleted successfully");
              }
            }
          );
    }
    res.redirect("admin/categorymanagement");
    }
    catch(er)
    {
      console.log(er);
    }
  
  
  };
  const fs = require('fs');
  const Category = require('path_to_category_model'); // Replace with the actual path to your Category model
  


  <div class="card mb-4">
                <table class="table table-hover" id="dataTable">
                    <thead>
                      <tr>
                        <th scope="col">id</th>
                        <th scope="col">Name</th>
                        <th scope="col">Brand Name</th>
                        <th scope="col">Category</th>
                        <th scope="col">Price</th>
                        <th scope="col">Sale Price</th>
                        <th scope="col">isListed</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                        <% for(var i=0;i<products.length;i++){ %>
                            <tr>
                              <td><%= i+1 %></td>
                              <td><%= products[i].productName %></td>
                              <td><%= products[i].brandName %></td>
                              <td><%= products[i].category %></td>
                              <td><%= products[i].regularPrice %></td>
                              <td><%= products[i].salePrice %></td>
                              <td><%= products[i].isListed %></td>
                              <td><%= products[i].quantity %></td>
                              <td> <div class="d-flex"><a href="/admin/edit-product/<%=products[i]._id%>" class="btn-sm btn-info me-auto">Edit</a> <a type="button" href="/admin/delete-product/<%=products[i]._id%>" class="btn-sm btn-danger">Delete</a></div>
                            </tr>
                            <% } %>
                  </table>
            </div> <!-- card end// -->





            <td class="text-center" data-title="Stock">
                                                <div class=" radius  m-auto">
                                                    <a class="btn px-2 py-0" onclick="changeQuantity('<%=userCart.cart[i].productId._id%>',-1,'<%=userCart.cart[i].productId.salePrice%>','subtot-0','cartSubTotal','total','qty-<%=userCart.cart[i].productId._id%>','<%=userCart.cart[i].productId.quantity%>',)">-</a>
                                                    <span id="qty-64ee2faccd3d4af729ebd9cb" class="qty-val mx-3">
                                                        1
                                                    </span>
                                                    <a class="btn px-2 py-0" onclick="changeQuantity('<%=userCart.cart[i].productId._id%>',1,'<%=userCart.cart[i].productId.salePrice%>','subtot-0','cartSubTotal','total','qty-<%=userCart.cart[i].productId._id%>','<%=userCart.cart[i].productId.quantity%>')">+</a>
                                                </div>
                                            </td>
        function changeQuantity(productId, count1, price, subTotal, cartSubTotal, total, quantity, stock) {
            // alert(stock)
            const count = parseInt(count1)
            // console.log(productId, count, price, subTotal, cartSubTotal, total, quantity);
            const subtotalValue = document.getElementById(subTotal).innerHTML
            const grandTotalValue = document.getElementById('grandTotal').innerHTML
            const quantityValue = document.getElementById(quantity).innerHTML

            let totalValue = parseInt(subtotalValue)

            if (parseInt(quantityValue) + count > parseInt(stock)) {

                if (count === 1) {
                    Swal.fire(
                        'Alert',
                        'Insufficient Stock',
                        'error'
                    );
                    return
                }
            }
            console.log(quantityValue, count);
            if (quantityValue == 1 && count == -1) {
                return;
            }
            $.ajax({
                url: '/change-quantity',
                method: 'post',
                data: {
                    productId,
                    count
                },
            })


            if (count === 1) {
                document.getElementById(subTotal).innerHTML = parseInt(price) + totalValue
                document.getElementById('grandTotal').innerHTML = parseInt(price) + parseInt(grandTotalValue);
                document.getElementById('total').innerHTML = parseInt(price) + parseInt(grandTotalValue);
                document.getElementById(quantity).innerHTML = parseInt(quantityValue) + 1;


            } else if (count === -1) {
                document.getElementById(subTotal).innerHTML = totalValue - parseInt(price)
                document.getElementById('grandTotal').innerHTML = parseInt(grandTotalValue) - parseInt(price);
                document.getElementById('total').innerHTML = parseInt(grandTotalValue) - parseInt(price);
                document.getElementById(quantity).innerHTML = parseInt(quantityValue) - 1;

            }


        }

        function removeCart(id,subTotal) {

            Swal.fire({
                title: 'Are you sure?',
                text: 'Do you want to delete this item from cart !',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes'
            }).then((result) => {
                if (result.isConfirmed) {

                    $.ajax({
                        url: '/remove-cart',
                        method: 'post',
                        data: {
                            id: id
                        },
                        success: function (res) {
                            if (res.success) {
                                Swal.fire(
                                    'Done!',
                                    'Item has been deleted.',
                                    'success'
                                ).then(() => {
                                    const rowToDelete = document.querySelector(`[data-wish-id="${id}"]`);
                                    if (rowToDelete) {
                                        // Delete the found row
                                        rowToDelete.remove();
                                        // Decrease the wishlist length
                                        const cartLength = document.getElementById('cartLength');
                                        cartLength.textContent = parseInt(cartLength.textContent) - 1;
                                        grandTotal.textContent =document.getElementById('grandTotal').textContent-parseInt(subTotal)
                                        total.textContent =document.getElementById('total').textContent-parseInt(subTotal)

                                        if(cartLength.textContent ==0){
                                            window.location.reload()
                                        }
                                    }


                                })
                            }
                        }
                    })

                }
            })

        }


        function noItem() {
            Swal.fire(
                'No Item in Cart!',
                'Add some items to the Cart!',
                'question'
            )
        }      







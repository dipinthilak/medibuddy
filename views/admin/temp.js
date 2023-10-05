

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










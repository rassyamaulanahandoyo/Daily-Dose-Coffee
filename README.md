npm init -y
npm install express ejs express-session bcryptjs qrcode
npx sequelize-cli init

mkdir controllers helpers middleware views data

touch app.js \
      controllers/controller.js \
      helpers/helper.js \
      middleware/auth.js

touch views/landing.ejs \
      views/register.ejs \
      views/login.ejs \
      views/products.ejs \
      views/addProduct.ejs \
      views/categories.ejs \
      views/categoryDetail.ejs \
      views/cart.ejs \
      views/checkout.ejs \
      views/profile.ejs \
      views/editProfile.ejs



# User & Profile
npx sequelize model:generate --name User     --attributes email:string,password:string,role:string


npx sequelize model:generate --name Profile  --attributes userId:integer,email:string,password:string,role:string

# Category & Product
npx sequelize model:generate --name Category --attributes name:string

npx sequelize model:generate --name Product  --attributes name:string,description:string,price:integer,stock:integer,imageURL:string

npx sequelize model:generate --name Detail   --attributes name:string,description:string


# Order
npx sequelize model:generate --name Order    --attributes qty:integer,status:string

## FK
npx sequelize migration:generate --name add-productId-to-Details

## SEEDING JSON

npx sequelize seed:generate --name categories
npx sequelize seed:generate --name details
npx sequelize seed:generate --name products
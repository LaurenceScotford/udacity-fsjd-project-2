import crypto from 'crypto';
import { CategoryStore } from '../../../src/models/categories';
import { UserStore } from '../../../src/models/users';
import { ProductStore } from '../../../src/models/products';
import { OrderStore } from '../../../src/models/orders';

const {
    SUPERUSER_AUTHLEVEL
} = process.env;

// Creates a valid foreign key of the requested type. Only the top-level object need be requested - if that object has further
// foreign key dependencies, these will be created automatically
async function getForeignKey(type: string): Promise<string> {
    try {
        let foreignKey: string;
        switch (type) {
            case 'category':
                const catStore = new CategoryStore();
                // Create a new unique category name
                let catName = '';
                while (catName === '') {
                    catName = getRandomString();
                    const catEntries = await catStore.index();
                    if (catEntries.find(el => el.category.toLowerCase() === catName.toLowerCase())) {
                        catName = '';
                    }
                }

                // Create the new category
                const newCat = await catStore.create({
                    id: '',
                    category: catName
                })

                // Return the requested foreign key
                return newCat.id.toString();
            case 'user':
                const userStore = new UserStore();
                // Create a new unique username
                let userName = '';
                while (userName === '') {
                    userName = getRandomString();
                    const userEntries = await userStore.index(SUPERUSER_AUTHLEVEL as string);
                    if (userEntries.find(el => el.username.toLowerCase() === userName.toLowerCase())) {
                        userName = '';
                    }
                }
                const newUser = await userStore.create({
                    id: '',
                    auth_level: '1',
                    first_name: getRandomString(),
                    last_name: getRandomString(),
                    username: userName,
                    password: getRandomString()
                });

                // Return the requested foreign key
                return newUser.id.toString();
            case 'product':
                const productStore = new ProductStore();
                const catId = await getForeignKey('category');
                const newProduct = await productStore.create({
                    id: '',
                    name: getRandomString(),
                    price: Math.round(Math.random() * 10000) / 100,
                    url: getRandomString(),
                    description: getRandomString(),
                    category: catId
                });

                // Return the requested foreign key
                return newProduct.id.toString();
            case 'order':
                const orderStore = new OrderStore();
                const productId = await getForeignKey('product');
                const userId = await getForeignKey('user');
                const newOrder = await orderStore.create({
                    id: '',
                    user_id: userId,
                    recipient_name: 'Fred Bloggs',
                    delivery_address: '1 My Street, My Town',
                    date_time: null,
                    status: 'complete',
                    products: [{
                        product_id: productId,
                        quantity: 5
                    }]
                });
                return newOrder.id.toString();
            default:
                throw new Error('Foreign key table not recognised');

        }
    } catch (err) {
        throw new Error(`Could not create foreign key of type ${type}. ${err}`)
    }
}

// Get a random sting of hex digits
function getRandomString() {
    const length = 20;
    return crypto.randomBytes(length)
        .toString('hex')
        .slice(0, length);
}

export default getForeignKey;
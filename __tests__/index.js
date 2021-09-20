"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const userModel_1 = __importDefault(require("../src/model/userModel"));
const accountModel_1 = __importDefault(require("../src/model/accountModel"));
const transactionModel_1 = __importDefault(require("../src/model/transactionModel"));
let mongoServer;
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    mongoose_1.default.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }).then(() => console.log('Database Connected')).catch((error) => console.log(error));
});
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
    await mongoServer.stop();
});
describe('tests', () => {
    it('tests succesfully', () => {
        expect(1).toBe(1);
    });
});
const validUserSignup = {
    name: "Daniel Bright",
    email: "bukasin0@gmail.com",
    password: "12345",
};
const existingUserSignup = {
    name: "Daniel Bright",
    email: "bukasin2@gmail.com",
    password: "12345"
};
const inValidUserSignup1 = {
    name: "Daniel Bright",
    email: "bukasin0@gmail.com",
};
const userLogin = {
    email: "bukasin2@gmail.com",
    password: "12345"
};
const invalidUserLogin = {
    email: "bukasin0@gmail.com",
    password: "1234"
};
const userAccount = {
    account: "1234546578",
    amount: 500000
};
const invalidAccount = {
    account: "1234546",
    amount: 500000
};
const existingAccount = {
    account: "1234567890",
    amount: 50000
};
const transactionData = {
    from: "1234546578",
    to: "1234567890",
    amount: 1000,
    description: "tests"
};
const insufficientTransactionData = {
    from: "1234546578",
    to: "1234567890",
    amount: 10000000,
    description: "tests"
};
describe('Testing database', () => {
    test('Succesfully creates a new user', async () => {
        const user = new userModel_1.default({
            name: "Daniel Bright",
            email: "bukasin2@gmail.com",
            password: bcryptjs_1.default.hashSync("12345", 8)
        });
        const saveUser = await user.save();
        expect(saveUser).not.toBeNull();
        expect(saveUser).not.toBeUndefined();
        expect(saveUser).toBeTruthy();
        expect(saveUser.name).toBe("Daniel Bright");
        expect(saveUser.email).toBe("bukasin2@gmail.com");
    });
    test('Succesfully creates a new account', async () => {
        const user = userModel_1.default.findOne({ email: 'bukasin2@gmail.com' });
        const account = new accountModel_1.default({
            account: "1234567890",
            amount: 500000,
        });
        const saveAcc = await account.save();
        expect(saveAcc).not.toBeNull();
        expect(saveAcc).not.toBeUndefined();
        expect(saveAcc).toBeTruthy();
    });
    test('Succesfully creates a new transaction', async () => {
        const account = new transactionModel_1.default({
            reference: uuid_1.v4(),
            senderAccount: "1234546437",
            receiverAccount: "1234567885",
            amount: 10000,
            transferDescription: "req.body.description",
        });
        const saveTranz = await account.save();
        expect(saveTranz).not.toBeNull();
        expect(saveTranz).not.toBeUndefined();
        expect(saveTranz).toBeTruthy();
    });
});
describe('Post endpoints', () => {
    test('Succesfully signs up a new user', async () => {
        const res = await supertest_1.default(app_1.default)
            .post('/api/users/registration')
            .send(validUserSignup);
        expect(res.statusCode).toBe(200);
        expect(res.body._doc.name).toBe(validUserSignup.name);
        jest.setTimeout(10 * 1000);
    }, 10000);
    test('Returns error for already existing user signup', async () => {
        const res = await supertest_1.default(app_1.default)
            .post('/api/users/registration')
            .send(existingUserSignup);
        expect(res.statusCode).toBe(400);
        jest.setTimeout(10 * 1000);
    }, 10000);
    test('Returns error for incomplete signup details', async () => {
        const res = await supertest_1.default(app_1.default)
            .post('/api/users/registration')
            .send(inValidUserSignup1);
        expect(res.statusCode).toBe(400);
        expect(res.body.message).not.toBeUndefined();
    });
});
// test('Returns 404 for a signed in user with no accounts created', async () => {
//   const logRes = await request(app).post('api/users/signin').send(userLogin);
//   const res = await request(app)
//     .get('/accounts')
//     .set('authorization', `Bearer ${logRes.body.token}`);
//   expect(res.statusCode).toEqual(404);
// });
// test('Succesfully creates an account for a signed in user', async () => {
//   const logRes = await request(app).post('api/users/signin').send(userLogin);
//   console.log("dre",logRes)
//   const res = await request(app)
//     .post('/create-account')
//     .set("authorization", `Bearer ${logRes.body.token}`)
//     .send(userAccount);
//   expect(res.statusCode).toBe(201);
//   expect(res.body.account).toBe(userAccount.account);
//   expect(res.body.amount).toBe(userAccount.amount);
//   expect(typeof res.body.createdAt).toBe("string");
// });
//   test('Returns error when creating an already existing account number', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .post('/user/create-account')
//       .set("Cookie", `myCookie=${logRes.body.token}`)
//       .send(existingAccount);
//     expect(res.statusCode).toBe(404);
//     expect(res.body.message).toBe("Account number already exists");
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//   });
//   test('Returns error when creating an invalid account number', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .post('/user/create-account')
//       .set("Cookie", `myCookie=${logRes.body.token}`)
//       .send(invalidAccount);
//     expect(res.statusCode).toBe(404);
//     expect(res.body.message).toBe("\"account\" length must be 10 characters long");
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//   });
//   test('Succesfully creates a transaction for a signed in user', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .post('/user/transfer')
//       .set("Cookie", `myCookie=${logRes.body.token}`)
//       .send(transactionData);
//     expect(res.statusCode).toBe(201);
//     expect(res.body.senderAccount).toBe(transactionData.from);
//     expect(res.body.receiverAccount).toBe(transactionData.to);
//     expect(res.body.amount).toBe(transactionData.amount);
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//   });
//   test('Returns transaction error for insufficient funds transfer', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .post('/user/transfer')
//       .set("Cookie", `myCookie=${logRes.body.token}`)
//       .send(insufficientTransactionData);
//     expect(res.statusCode).toBe(404);
//     expect(res.body.error).toBe("Insufficient funds");
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//   });
// });
// describe('Get Requests', () => {
//   test('Returns status 301 for unauthenticated user', async () => {
//     const res = await request(app).get('/user/balances');
//     expect(res.statusCode).toEqual(301);
//     expect(res.body.message).toBe("jwt must be provided");
//   });
//   test('Gets all balances for a signed in user and returns status 200', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .get('/user/balances')
//       .set('Cookie', `myCookie=${logRes.body.token}`);
//     expect(res.statusCode).toEqual(200);
//     expect(res.body).toHaveProperty("data");
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//   });
//   test('Gets an updated amount for a user after a transaction', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .get('/user/balances/1234546578')
//       .set('Cookie', `myCookie=${logRes.body.token}`);
//     expect(res.statusCode).toEqual(200);
//     expect(res.body.amount).toBe(userAccount.amount - transactionData.amount);
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//   });
//   test('Returns an error trying to get an account amount not yours', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .get('/user/balances/1234567890')
//       .set('Cookie', `myCookie=${logRes.body.token}`);
//     expect(res.statusCode).toEqual(404);
//     expect(res.body.message).toBe('Account not yours');
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//   });
//   test('Returns an error trying to get an account not on the database', async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .get('/user/balances/1234567891')
//       .set('Cookie', `myCookie=${logRes.body.token}`);
//     expect(res.statusCode).toEqual(404);
//     expect(res.body.message).toBe('Account not found');
//     await request(app).get(`/user/logout`).set('Cookie', `myCookie=${logRes.body.token}`);
//     jest.setTimeout(10 * 1000);
//   }, 10000);
//   test('Returns 404 for invalid login details', async () => {
//     const res = await request(app).post('/user/login').send(invalidUserLogin);
//     expect(res.statusCode).toEqual(404);
//   });
//   test("It successfully logs out a loggedin user", async () => {
//     const logRes = await request(app).post('/user/login').send(userLogin);
//     const res = await request(app)
//       .get('/user/logout')
//       .set('Cookie', `myCookie=${logRes.body.token}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body.message).toBe('logged out');
//   });
//# sourceMappingURL=index.js.map
import mongoose from 'mongoose';
import bcrypt  from 'bcrypt';

class MongoService {

    constructor() {
        const userSchema = this.getSchema();
        this.userModel = mongoose.model('user', userSchema);
    }

     async connect() {
         mongoose.connect(process.env.MONGOUSERURL)
             .then(() => console.log('Mongo connected'))
             .catch(err => console.log(err));
     }
    async createUser(username, password){
        const salt = await bcrypt.genSalt(10);
        const data = new this.userModel({
            username: username,
            password: await bcrypt.hash(password, salt)
        });
        return data.save();
    }

    async findUser(username) {
        const user = await this.userModel.findOne({username: username}).exec();

        return !!user;
    }

    async checkUserAndCredentials(username, password){
        const user = await this.userModel.findOne({username: username}).exec();

        return !!(user && bcrypt.compareSync(password, user.password));
    }

    async disconnect() {
         mongoose.disconnect().then(() => console.log('Mongo discoencted'))
             .catch(err => console.log(err));
    }

    getSchema() {
        const { Schema } = mongoose;
        return new Schema({
            timestamp: Date,
            username: String,
            password: String
        })
    }
}

export default MongoService;
import mongoose from 'mongoose';
import bcrypt  from 'bcrypt';

class MongoService {

     async connect() {
         mongoose.connect('mongodb+srv://test:NMZQbTCltcIhpUa3@cluster0.zxw9v.mongodb.net/usersdb?retryWrites=true&w=majority')
             .then(() => console.log('Mongo connected'))
             .catch(err => console.log(err));
     }
    async createUser(username, password){
        const salt = bcrypt.genSaltSync(10);
        const userSchema = this.getSchema();
        const userModel = mongoose.model('user', userSchema);
        const data = new userModel({
            username: username,
            password: bcrypt.hashSync(password, salt)
        });
        return await data.save();
    }

    async findUser(username) {
        const userSchema = this.getSchema();
        const userModel = mongoose.model('user', userSchema);
        const user = userModel.find({username: username}).exec();

        return !!user;
    }

    async disconect() {
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
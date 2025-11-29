import { UserModel } from "../model/user_model";
import { toUserEntity } from "../dto/user_dto";
export const userRepository = {
    async create(UserEntity){
        const user = await UserModel.create(UserEntity);
        return toUserEntity(user);
    },
    async findByUsername (username){
        const user  = await UserModel.findOne({username});
        return toUserEntity(user);
    },
    async findByEmail(email){
        const user  = await UserModel.findOne({email});
        return toUserEntity(user)
    },
    async findById(id){
        const user  = await UserModel.findOne({id});
        return toUserEntity(user);
    },
    async update(id,updateData){
        const updated =  await UserModel.findByIdAndUpdate(id,updateData, {new:true});
        return toUserEntity(updated);
    },
    async saveRefreshToken(refreshToken){
        await UserModel.findByIdAndUpdate(id,{refreshToken});

    },
    async findByRefreshToken(refreshToken){
        const user = await UserModel.findOne({refreshToken});

    },
    async revokeRefreshToken(id){
        await UserModel.findByIdAndUpdate(id,{refreshToken:null});
    },


};
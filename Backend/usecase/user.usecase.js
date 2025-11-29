import {user as UserEntity}  from "../domain/entities/user.entity"
export const userUsecase  = (
    userRepository,
    passwordService,
    jwtService
) => {
    // register user

    const register = async(userData)=>{
        const  user =  new UserEntity(userData);
        if (!user.isValid()){
            throw new Error("invalid user data")
        }
        // checking dublicate
        const existingUser  = await userRepository.findByUsername(user.username);
        if (existingUser) throw new Error("username already exist");
        
        const existingEmail = await userRepository.findByEmail(user.email);
        if (existingEmail) throw new Error("email already registered");
        user.password = await passwordService.hash(user.password);

        const createdUser  = await userRepository.create(user);
    };

    // login user

    const login =  async(username ,password)=>{


        const  user =  await userRepository.findByUsername(username);
        if (!user) throw new Error("invalid credential");
        const  passwordMatch  = await passwordService.compare(password,user.password);
        if (!passwordMatch) throw new Error("invalid credential");

        const accessToken  =  await  jwtService.generateAccesToken({id:user.id});
        const refreshToken =  await jwtService.generateRefreshToken({id:user.id});
        await userRepository.saveRefreshToken(user.id ,refreshToken);

        return {
            user,
            accessToken,
            refreshToken
        };
    };
    const refreshToken =  async(token) =>{
        const payload =  await jwtService.verifyRefreshToken(token);
        const user =  await userRepository.findById(payload.id);
        if (!user) throw Error("user not found");
        const newAccess =  await jwtService.generateAccesToken({id:user.id});
        const newRefresh = await jwtService.generateRefreshToken({id : user.id});
        await userRepository.saveRefreshToken(user.id,newRefresh);
        return {accessToken:newAccess,refreshToken:newRefresh};
    };
    const getProfile  = async (id)=>{
        const  user  =  await userRepository.findById(id);
        if (!user) throw new Error("usr not found");
        return user;
    }
    const updateProfile   = async(id, updatedData)=>{
        const updated  =  await userRepository.update(id,updatedData);
       return updated;
    };
    return {
        register,
        login,
        refreshToken,
        getProfile,
        updateProfile,
    };


};
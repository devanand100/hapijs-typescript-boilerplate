import userModel from '../models/user.model'

class UserService {
    static async getUserById(id: string) {
        const user = await userModel.findById(id)
        return user
    }
}

export default UserService

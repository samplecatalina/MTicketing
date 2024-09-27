import mongoose from 'mongoose'

export default () => new mongoose.Types.ObjectId().toHexString()

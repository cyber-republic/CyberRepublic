import { Schema } from 'mongoose'
import { CommentSchema } from './CommentSchema';
import { SubscriberSchema } from './SubscriberSchema';

export const Suggestion = {
    title: String,
    desc: String,
    likes: Number,
    dislikes: Number,
    views: Number,
    activeness: Number,
    comments: [[CommentSchema]],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    isAbuse: Boolean,
    isDelete: Boolean,
    subscribers: [SubscriberSchema]
}

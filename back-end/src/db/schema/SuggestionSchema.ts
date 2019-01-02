import { Schema } from 'mongoose'
import { CommentSchema } from './CommentSchema';
import { SubscriberSchema } from './SubscriberSchema';
import { constant } from '../../constant';

export const Suggestion = {
    title: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    likes: {
        type: [Schema.Types.ObjectId],
        default: [],
    },
    likesNum: {
        type: Number,
        default: 0,
    },
    dislikes: {
        type: [Schema.Types.ObjectId],
        default: [],
    },
    dislikesNum: {
        type: Number,
        default: 0,
    },
    views: {
        type: Number,
        default: 0
    },
    activeness: {
        type: Number,
        default: 0
    },
    comments: [[CommentSchema]],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    // constans.SUGGESTION_STATUS: ACTIVE, ABUSED, ARCHIVED. abuse will also be archived
    status: {
        type: String,
        default: constant.SUGGESTION_STATUS.ACTIVE
    },
    abusedStatus: String, // constant.SUGGESTION_ABUSED_STATUS: REPORTED, HANDLED
    subscribers: [SubscriberSchema]
}

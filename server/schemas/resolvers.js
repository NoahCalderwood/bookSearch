const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')
                    .populate('savedBooks')

                return userData
            }
            throw new AuthenticationError('Please log in!');
        },
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            console.log('this is firing', username, email, password);
            const user = await User.create({ username, email, password });
            console.log(user);
            const token = signToken(user);
            console.log(token);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect Email or Password');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect Email or Password');
            }

            const token = signToken(user);

            return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true }
                );

                return updatedUser;
            }
            throw AuthenticationError('Please log in!');
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );

                return updatedUser;
            }
            throw AuthenticationError('Please log in!');
        },
    },
};

module.exports = resolvers;
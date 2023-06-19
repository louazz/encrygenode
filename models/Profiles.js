const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProfilesSchema = new Schema({
  institution: String,
  country: String,
  city: String,
  postcode: String,
  company: String,
  user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Users'
      }

});
mongoose.model('Profiles', ProfilesSchema);

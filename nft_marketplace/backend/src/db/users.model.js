
module.exports = (mongoose) => {
  const User = mongoose.model(
    "User",
    mongoose.Schema(
      {
        address: String,
        username: String,
        avatar: String,
        userBio: String,
        websiteURL: String,
        banner: String,
        verified: Boolean,
        customURL: String,
        twitter: String,
        socials: String,
        password : String
      },
      { timestamps: true }
    )
  );

  return User;
}

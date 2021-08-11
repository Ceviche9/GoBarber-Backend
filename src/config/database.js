module.exports = {
  dialect: 'postegres',
  host: 'localhost',
  usernasme: 'postgres',
  password: 'docker',
  database: 'Gobarber',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  }
};

module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'Gobarber',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  }
};

module.exports = (req, res) => {
    res.status(404).send({error: "Please use this path format to get your badges: /@spscommerce/packagename"})
};
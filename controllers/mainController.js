// Render the home page
exports.index = (req, res) => {
    res.render('./main/index');
}

// Render the contact page
exports.contact = (req, res) => {
    res.render('./main/contact');
}

// Render the about page
exports.about = (req, res) => {
    res.render('./main/about');
}

const output = `
<p>You have a new quote request</p>
<h3>Contact Details</h3>
<p>Name: ${req.body.name}<br>
   Email: ${req.body.email}<br>
   Tel: ${req.body.telno}<p>
<h3>Insurance Required</h3>
<p>Type of insurance required: ${req.body.type}<br>
   Renewal Date: ${req.body.renewal_date === undefined ? 'Not entered' : req.body.renewal_date}</p>
<h3>Business Details</h3>
<p>Company: ${req.body.company === undefined ? 'Not given' : req.body.company}<br>
   Address: ${req.body.houseNameNumber} ${req.body.address_1}<br>
            ${req.body.address_2 === '' ? req.body.town : req.body.address_2}<br>
            ${req.body.town}<br>
            ${req.body.city}<br>
            ${req.body.postcode}<br>
</p>
<h3>Other Information</h3>
<p>${req.body.message === undefined ? 'None' : req.body.message}</p>
<div><img src="cid:batman"</div>
`;
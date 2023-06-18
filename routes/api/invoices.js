const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Products = mongoose.model('Invoices');
const P = mongoose.model('Products');
const Clients= mongoose.model('Clients');
const User=  mongoose.model('Users');
const Profiles=  mongoose.model('Profiles');
const {encr, decr,f}= require('./Feistel.js');
var nodemailer = require('nodemailer');
var QRCode = require('qrcode')
var html_to_pdf = require('html-pdf-node');


var transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: "encrygen@gmail.com",
      pass: "vniwrrfbdwwxziqr"
    },
    tls:{
        rejectUnauthorized:false,
    }
  });

  router.post('/send',auth.optional, async (req, res, next) => {
    const { body: { mail } } = req;
    console.log(mail.email)
      let info = await transporter.sendMail({
        from: `"Feedback@EncrygeN"<${mail.email}>`,
        to: 'encrygen@gmail.com',
        subject: 'feedback✔',
        text: 'Important',
        html: `${mail.content} <br> ${mail.email}`
      });
      console.log("Message sent: %s", info.messageId);
   return  res.ok
})
router.get('/', auth.required, async (req, res, next) => {
    try {
        const products= await Products.find();

        res.status(200).json(products);
    } catch(error) {
        res.status(404).json({message: error.message});
    }
})/*
router.get("/pdf/:id", auth.optional, async (req, res, next)=>{
    let options = { format: 'A4' };
    const id= req.params.id
    const products= await Products.findOne({_id: id});
    const client= await Clients.findOne({_id:products.client});
    const profile= await Profiles.findOne({user:products.user})
    let file = { content: `<html><head><title>Doc ${Date()}</title><link rel="stylesheet" href="/main.css"> <link rel="stylesheet" href="/App.css">    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.css"></head><body ><div class="container">
    <div class="box" >
                        <div class="one"><p><small> {client["name"]}<br />
                            ${client["Faddress"]}<br />
                            ${client["country"]}<br />
                            ${client["city"]}<br />
                            ${client["postcode"]}</small></p> </div>
                        <div class="one"><p class="float-right"><small>{profile.Institution} <br />
                            ${profile.postcode} <br />
                            ${profile.city} <br />
                            ${profile.country}</small></p></div>
                    </div>

                    <center><h5>Invoice</h5><p><small>id: ${id}</small></p> <p> <canvas id="qrcode"></canvas><br/><small>scan and share</small></p> </center>
                    <table>
                        <thead>
                            <tr>
                                <th colspan="3">Product</th>
                                <th>Total: ${total} £</th>

                            </tr>
                            <tr>
                                <th>id</th>
                                <th>name</th>
                                <th>price</th>
                                <th>quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                                products.map(
                                    product => <>
                                        <tr>
                                            <td><strong>{product.id}</strong></td>
                                            <td>{product.name}</td>
                                            <td>{product.price} £</td>
                                            <td>{product.quantity}</td>
                                        </tr> </>
                                )
                            }

                        </tbody>
                    </table>
                    <div className="box">
                        <div className="one"><small>Date and time: ${Date()}</small></div>
                        <div className="one"><p className="float-right"><small>signature</small></p></div>
                    </div></div><script type="text/javascript">
                    new QRious({element: document.getElementById("qrcode"), value: "https://webisora.com"});
                    </script><script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.js"></script></body></html>
    ` };
    html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
        console.log("PDF Buffer:-", pdfBuffer);
        res.sendFile(pdfBuffer)
      });
})*/
router.post('/display', auth.optional, async (req, res, next) => {
    console.log("key:"+ req.body.key)
    console.log("id:"+ req.params.id)
    
        if(!req.body.userid){
            try {   
                const url=req.body.url;
                let prime=decodeURI(url)
                //let prime= req.params.id
                console.log("id:"+ prime)
                key= req.body.key
                console.log()
          
           let id= await decr(prime,f,key)
           console.log(id)
    
          
            const products= await Products.findOne({_id: id});
            const client= await Clients.findOne({_id:products.client});
            const profile= await Profiles.findOne({user:products.user})
       
          let pq=[];
           for(i in products.products){
               const p= await P.findOne({_id: products.products[i].product})
               pq.push(
                   {   "id": p._id,
                       "name": p.name,
                       "price": p.price,
                       "quantity": products.products[i].quantity
                   }
               )
           }
           const user= await User.findOne({_id: products.user});
           console.log(user)
           res.status(200).json({
               
                   "_id": products._id,
                   "products":pq,
                   "client": client,
                   "total": products.total,
                   "user": user,
                   "profile": profile,
                   "content": products.content,
                   "date": products.created_at

               }
           );
        } catch(error) {
            res.status(404).json({message: error.message});
        }
         }else{
            try {
                const products= await Products.findOne({_id: req.params.id  ,user: req.body.userid});
                const client= await Clients.findOne({_id:products.client});
                const profile= await Profiles.findOne({user:products.user})
                
               let pq=[];
                for(i in products.products){
                    const p= await P.findOne({_id: products.products[i]._id})
                    pq.push(
                        {
                            "product": p,
                            "quantity": products.products[i].quantity
                        }
                    )
                }
                const user= User.findOne({_id: products.user});
                console.log(user)
                res.status(200).json({
                    
                        "_id": products._id,
                        "products":pq,
                        "client": client,
                        "total": products.total,
                        "user": user,
                        "profile": profile,
                        "date": products.created_at

                    }
                );
            } catch(error) {
                res.status(404).json({message: error.message});
            }
         }
})
router.get('/:userid', auth.required, async (req, res, next) => {
    try {
        const products= await Products.find({user: req.params.userid});

        res.status(200).json(products);
    } catch(error) {
        res.status(404).json({message: error.message});
    }
})
router.post('/new', auth.required, async (req, res, next) => {
      const { body: { invoice } } = req;
      console.log(invoice.key)
       invoice.total=0
       for(var i = 0; i < invoice.products.length; i++) {
        var obj = invoice.products[i];
        let productPrice= await P.findOne({_id: obj.product})  
        invoice.total= invoice.total+(productPrice.price * obj.quantity)
    }
      key= invoice.key
      console.log(key)
    const newproducts = await new Products(invoice)
    const user= await User.findOne({_id: newproducts.user});
    let u= await encr(newproducts._id.toString(),f, key)
    console.log("encryption: "+u);
    newproducts.encr= u.toString()
    try {
        await newproducts.save();
        let img = await QRCode.toDataURL('http://46.101.201.7/invoice/'+encodeURI(newproducts.encr));
        let info = await transporter.sendMail({
            from: '"EncrygeN 👻" <ecrygen@gmail.com>',
            to: user.email,
            subject: `Your last generation: ${newproducts._id} ✔`,
            text: 'Important',
            attachDataUrls: true,
            html: `Dear user, <p>You have generated a document using encrygen with the following details: </p><h4>key: ${invoice.key}</h4> </br> <img src= ${img} >${'http://46.101.201.7/invoice/'+encodeURI(newproducts.encr)}<p>Best,</p><p>EncrygeN Team</p> `
          });
       res.status(201).json(newproducts);

    } catch(error) {
        res.status(400).json({ message : error.message});
    }

})

router.patch('/update/:id', auth.required, async(req, res, next) => {
    const id= req.params.id;
      const { body: { invoice } } = req;
      console.log(invoice);
      let u= await encr(id,f, invoice.key)
      console.log("encryption: "+u);
    try{ 
     const  p= await Products.findOneAndUpdate({
            _id: id,
        },{
            encr: u
        }
        )
        console.log(p.encr)
        res.status(202).json({_id: id});

    } catch (error) {
        res.status(401).json({message: error.message});
    }

})
router.patch('/addproductinvoice/:id', auth.required, async(req, res, next) => {
    const id= req.params.id;
    productquantity= req.body.product
    try{
      let invoice=  await Products.findOne({
            _id: id,
        }
        )

        invoice.products.push(productquantity);
        await Products.findOneAndUpdate({_id: id}, invoice)
        res.status(202).json({_id: id});

    } catch (error) {
        res.status(401).json({message: error.message});
    }

})
router.delete('/delete/:id', auth.required, async (req, res, next) => {
    const id= req.params.id;

    try {
        await Products.findOneAndRemove({_id: id});
     res.status(203).json({id:id});

    }catch(error) {
     res.status(402).json({message: error.message});
    }

})
module.exports = router;

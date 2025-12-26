const fetch =(...args)=>
  import("node-fetch").then(({default:fetch})=>fetch(...args))

exports.userManagement=async(req,res)=>{
  try{
    //login check
    if(!req.session.token){
      return res.redirect('/');
    }
    const token=req.session.token;
    //fetch api to get user data
    const response=await fetch("https://oprsk.bizengineconsulting.com/api/auth/logout",{
      method:"GET",
      headers:{
        Authorization:`Bearer ${token}`,
        Accept:"application/json",
      },
  });
    const data=await response.json();
    console.log("User data fetched:",data);
    
}
   catch (error) {
    console.error("Error fetching user data:", error);
  }
};
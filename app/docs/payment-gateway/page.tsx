import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/ui/code-block'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Shield, 
  Zap, 
  Globe, 
  CheckCircle,
  Code,
  Play,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    title: 'Multiple Payment Methods',
    description: 'Accept payments via Credit/Debit Cards, UPI, Wallets, Net Banking, and more',
    icon: CreditCard
  },
  {
    title: 'Bank-Grade Security',
    description: 'PCI DSS compliant with advanced fraud detection and encryption',
    icon: Shield
  },
  {
    title: 'Instant Processing',
    description: 'Real-time payment processing with immediate confirmation',
    icon: Zap
  },
  {
    title: 'Global Coverage',
    description: 'Support for multiple currencies and international cards',
    icon: Globe
  }
]

const integrationSteps = [
  {
    step: 1,
    title: 'Initialize SDK',
    description: 'Set up the SabPaisa Payment Gateway SDK in your application'
  },
  {
    step: 2,
    title: 'Create Payment Request',
    description: 'Generate a payment request with customer and order details'
  },
  {
    step: 3,
    title: 'Process Payment',
    description: 'Redirect customer to payment page or use embedded checkout'
  },
  {
    step: 4,
    title: 'Handle Response',
    description: 'Process payment success/failure and update order status'
  }
]

const javaImplementation = `@Service
public class SabService {

    @Value("\${clientCode}")
    private String clientCode;

    @Value("\${transUserName}")
    private String transUserName;

    @Value("\${transUserPassword}")
    private String transUserPassword;

    @Value("\${callbackUrl}")
    private String callbackUrl;

    @Value("\${authKey}")
    private String authKey;

    @Value("\${authIV}")
    private String authIV;

    public ModelAndView getSabPaisaPgService() {

        String spURL = null;

        String payerName = "Test";
        String payerEmail = "xyz@gmail.com";
        long payerMobile = 987456331;
        String clientTxnId = RandomStringUtils.randomAlphanumeric(20).toUpperCase();
        System.out.println("clientTxnId :: " + clientTxnId);
        byte amount = 5;
        char channelId = 'W';

        spURL = "payerName=" + payerName.trim() + "&payerEmail=" + payerEmail.trim() + "&payerMobile=" + payerMobile
               + "&clientTxnId=" + clientTxnId.trim() + "&amount=" + amount + "&clientCode=" + clientCode.trim()
               + "&transUserName=" + transUserName.trim() + "&transUserPassword=" + transUserPassword.trim()
               + "&callbackUrl=" + callbackUrl.trim() + "&channelId=" + channelId;

        System.out.println("spURL :: " + spURL);

        try {
            spURL = AES256HMACSHA384HEX.encrypt(authKey.trim(), authIV.trim(), spURL.trim());
        } catch (Exception e) {
            e.printStackTrace();
        }

        ModelAndView view = new ModelAndView("NewFile");

        view.addObject("encData", spURL);
        view.addObject("clientCode", clientCode);

        return view;
    }

    public String getPgResponseService(String encResponse) {

        String decText = null;
        try {
            decText = AES256HMACSHA384HEX.decrypt(authKey.trim(), authIV.trim(), encResponse);
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("decrypted string: " + decText);
        if (decText != null) {
            String[] arr = decText.split("&");
            for (String str : arr)
                System.out.println(str);
        }
        return decText;
    }
}`

const pythonImplementation = `import datetime

class PgService:
    def __init__(self,
                 client_code="XXXXX",
                 trans_user_name="XXXXXXXX",
                 trans_user_password="XXXXXXXX",
                 auth_key="XXXXXXXXXXXXXXXXXXXXX",
                 auth_iv="XXXXXXXXXXXXXXXXXXXXXXXXXX",
                 call_back_url="http://127.0.0.1:8000/pg/response/",
                 sp_domain="https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1"
    ):
        self.client_code = client_code
        self.trans_user_name = trans_user_name
        self.trans_user_password = trans_user_password
        self.call_back_url = call_back_url
        self.sp_domain = sp_domain

        self.crypto = AES256HMACSHA384HEX(auth_key, auth_iv)

    def request(self):
        payer_name = 'vimal'
        payer_mobile = '1234567891'
        payer_email = 'test@gmail.com'

        client_txn_id = datetime.datetime.now().strftime("%Y%m%d%H%M%S%f")
        amount = '10'
        amount_type = 'INR'
        channel_id = 'W'

        url = (
            f"payerName={payer_name}"
            f"&payerEmail={payer_email}"
            f"&payerMobile={payer_mobile}"
            f"&clientTxnId={client_txn_id}"
            f"&amount={amount}"
            f"&clientCode={self.client_code}"
            f"&transUserName={self.trans_user_name}"
            f"&transUserPassword={self.trans_user_password}"
            f"&callbackUrl={self.call_back_url}"
            f"&amountType={amount_type}"
            f"&channelId={channel_id}"
        )

        encrypted = self.crypto.encrypt(url).strip()
        return encrypted

    def res(self, enc_response):
        decrypted = self.crypto.decrypt(enc_response.strip())
        return decrypted.split("&")`

const nodeImplementation = `app.get("/initPgReq", (req, res) => {
  const payerName = "Name";
  const payerEmail = "test@email.in";
  const payerMobile = "1234567890";
  const clientTxnId = randomStr(20, "12345abcde");
  const amount = 20;
  const clientCode = "XXXXX";
  const transUserName = "XXXXXXXX";
  const transUserPassword = "XXXXXXX";
  const callbackUrl = "http://localhost:3000/getPgRes";
  const channelId = "W";
  const spURL = "https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1"; // Staging

  const mcc = "5666";

  const now = new Date();
  const pad = n => n < 10 ? '0' + n : n;
  const transDate =
    now.getFullYear() + '-' +
    pad(now.getMonth() + 1) + '-' +
    pad(now.getDate()) + ' ' +
    pad(now.getHours()) + ':' +
    pad(now.getMinutes()) + ':' +
    pad(now.getSeconds());

  const stringForRequest =
    "payerName=" +
    payerName +
    "&payerEmail=" +
    payerEmail +
    "&payerMobile=" +
    payerMobile +
    "&clientTxnId=" +
    clientTxnId +
    "&amount=" +
    amount +
    "&clientCode=" +
    clientCode +
    "&transUserName=" +
    transUserName +
    "&transUserPassword=" +
    transUserPassword +
    "&callbackUrl=" +
    callbackUrl +
    "&channelId=" +
    channelId +
    "&mcc=" +
    mcc +
    "&transDate=" +
    transDate;

  console.log("stringForRequest :: " + stringForRequest);

  let encryptedStringForRequest;
  try {
    encryptedStringForRequest = encrypt(stringForRequest);
  } catch (err) {
    console.error("Encryption failed:", err);
    return res.status(500).send("Encryption error");
  }

  console.log("encryptedStringForRequest :: " + encryptedStringForRequest);

  const formData = {
    spURL: spURL,
    encData: encryptedStringForRequest,
    clientCode: clientCode,
  };

  res.render(__dirname + "/pg-form-request.html", { formData: formData });
});`

const phpImplementation = `<?php 
session_start();
include 'Authentication.php';

$clientCode='XXXXX';
$username='XXXXX';
$password='XXXXXXX';
$authKey='XXXXXXXXXXXXXXXXXX';
$authIV='XXXXXXXXXXXXXXXXXXXXX';

$payerName='name';
$payerEmail='Test@email.in';
$payerMobile='1234567890';
$payerAddress='Patna, Bihar';

$clientTxnId=rand(1000,9999);
$amount=10;
$amountType='INR';
$mcc=5137;
$channelId='W';
$callbackUrl='http://127.0.0.1/php2.0/SabPaisaPostPgResponse.php';

$encData="?clientCode=".$clientCode."&transUserName=".$username."&transUserPassword=".$password
."&payerName=".$payerName."&payerMobile=".$payerMobile."&payerEmail=".$payerEmail
."&payerAddress=".$payerAddress."&clientTxnId=".$clientTxnId."&amount=".$amount
."&amountType=".$amountType."&mcc=".$mcc."&channelId=".$channelId."&callbackUrl=".$callbackUrl;

$AES256HMACSHA384HEX = new AES256HMACSHA384HEX(); 
$data = $AES256HMACSHA384HEX->encrypt($authKey, $authIV, $encData);
?>

<form action="https://stage-securepay.sabPaisa.in/SabPaisa/sabPaisaInit?v=1" method="post">
  <input type="hidden" name="encData" value="<?php echo $data ?>" id="frm1">
  <input type="hidden" name="clientCode" value ="<?php echo $clientCode ?>" id="frm2">
  <input type="submit" id="submitButton" name="submit">
</form>`

export default function PaymentGatewayPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Payment Gateway</h1>
            <Badge variant="secondary">Popular</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            Accept online payments seamlessly with SabPaisa's robust payment gateway. Support for multiple payment methods, advanced security, and real-time processing.
          </p>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Integration Guide */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Integration Steps</h2>
          <div className="space-y-4">
            {integrationSteps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    {step.step}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-12" />

        {/* Code Examples */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Implementation Examples</h2>
          
          <Tabs defaultValue="java" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="java">Java implementation</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="php">PHP Implementation</TabsTrigger>
              <TabsTrigger value="node">Node.js implementation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="java">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Java PSP Service</h3>
                <p className="text-muted-foreground">Spring-based service to encrypt parameters and render hosted checkout.</p>
                <CodeBlock 
                  code={javaImplementation} 
                  language="java" 
                  filename="SabService.java"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="php">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">PHP Implementation</h3>
                <p className="text-muted-foreground">
                  Example server-side form post using AES256 encryption helpers:
                </p>
                <CodeBlock 
                  code={phpImplementation} 
                  language="php" 
                  filename="payment-request.php"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="python">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Python</h3>
                <p className="text-muted-foreground">Example service that encrypts requests and decrypts responses.</p>
                <CodeBlock 
                  code={pythonImplementation} 
                  language="python" 
                  filename="pg_service.py"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="node">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Node.js implementation</h3>
                <p className="text-muted-foreground">Generate encData and post the form using Express.</p>
                <CodeBlock 
                  code={nodeImplementation} 
                  language="javascript" 
                  filename="initPgReq.js"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="my-12" />

        {/* Testing */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Testing & Sandbox</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Try API Playground
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Test payment gateway APIs interactively with our built-in playground tool.
                </CardDescription>
                <Button asChild>
                  <Link href="/playground">
                    Open Playground
                    <Play className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Sandbox Environment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Use our sandbox environment for safe testing without processing real payments.
                </CardDescription>
                <Button asChild variant="outline">
                  <Link href="/sandbox">
                    Access Sandbox
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you integrate the payment gateway successfully.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/community">Join Community</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/docs/api">API Reference</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

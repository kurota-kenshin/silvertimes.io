export default function Privacy() {
  return (
    <section className="relative bg-background-primary py-32 px-4 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-blue-500/8 border border-blue-500/15 rounded-full mb-6">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-base text-silver-400 max-w-2xl mx-auto">
            Website Privacy Policy for Silver Times Global Inc.
          </p>
        </div>

        {/* Privacy Content */}
        <div className="bg-background-secondary/30 backdrop-blur-sm border border-white/5 rounded-2xl p-8 space-y-8 text-sm text-silver-400 leading-relaxed">
          {/* Introduction */}
          <div>
            <p className="mb-4">
              This Privacy Policy (the "<strong className="text-white">Privacy Policy</strong>"), together with our Terms and Conditions (the "<strong className="text-white">Terms</strong>"), governs the collection, processing, use, retention and disclosure of your personal data by Silver Times Global Inc. and its Affiliates (defined hereinafter) (collectively referred to as "<strong className="text-white">we</strong>", "<strong className="text-white">us</strong>" or "<strong className="text-white">our</strong>") in connection to your contact with us regarding various information, materials, products and services (the "<strong className="text-white">Services</strong>") that you would like to acquire from us, through media including but not limited to accessing our website (the "<strong className="text-white">Website</strong>"), and using any software, application or platform that we make available that allows you to access the relevant Services (the "<strong className="text-white">Related Platforms</strong>").
            </p>

            <p className="mb-4">
              In this Privacy Policy, "<strong className="text-white">personal data</strong>" shall have the meaning given in the Personal Data (Privacy) Ordinance (Chapter 486 of the Laws of Hong Kong) (the "<strong className="text-white">PDPO</strong>") and includes without limitation any information which may, in itself or together with any other information, identify a user any of its Relevant Person(s) (defined hereinafter) as an individual, such as name, address, e-mail address, mobile phone number and banking details, but does not include anonymised and/or aggregated data that does not identify a specific user.
            </p>

            <p className="mb-4">
              As used in this Privacy Policy, the term "<strong className="text-white">Affiliates</strong>" means a person, entity or company directly or indirectly, controlling, controlled by or under direct or indirect common control with another person, entity or company. Our Affiliates are referred to collectively as "<strong className="text-white">our Affiliates</strong>" in this Privacy Policy. The terms "<strong className="text-white">you</strong>" and "<strong className="text-white">your</strong>" shall refer to: (i) the person reading or accessing this Privacy Policy, or using or accessing our Website, the Related Platforms and/or the Services (the "<strong className="text-white">Users</strong>"); and (ii) where applicable or appropriate, each of the User's beneficial owners, directors, officers, authorised signatories, employees, representatives, guarantee/security providers and other natural persons related to you (the "<strong className="text-white">Relevant Persons</strong>"). You, together with the Relevant Persons are referred to collectively as "<strong className="text-white">User Parties</strong>".
            </p>

            <p>
              This Privacy Policy applies only to our Website, the Related Platforms and Services. Such updates will be published on our Website and/or the Related Platforms. By accessing or using our Website, the Related Platforms and/or the Services, you agree to be bound by this Privacy Policy and any amendments, modifications, updates and supplementations hereto and agree to the collection, processing, use and disclosure of your personal data as set out in this Privacy Policy. You represent and warrant that you have the valid consent and authority from you and your User Parties for us to collect, use, disclose and/or process your personal data as described herein. Nevertheless, you are advised to check the latest version of this Privacy Policy on the Website on a regular basis.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">1. Introduction</h2>

            <p className="mb-4">
              During the course of your contact with us, in order to provide our Services in compliance with the obligations imposed and required from time to time by the applicable laws and regulations ("<strong className="text-white">Applicable Laws</strong>"), including but not limited to those in the Government of the Hong Kong Special Administrative Region (hereunder referred as "<strong className="text-white">Hong Kong</strong>"), in particular those relating to anti-money laundering and counter-terrorist financing ("<strong className="text-white">AML/CTF</strong>"), including but not limited to the Anti-Money Laundering and Counter-Terrorist Financing Ordinance (Chapter 615 of the Laws of Hong Kong) (the "<strong className="text-white">AMLO</strong>"), we must ask you to provide certain personal data and other information which, not being personal data, nevertheless relates to you or your activities (collectively "<strong className="text-white">Personal Information</strong>"). Such Personal Information may include, without limitation, identification information (such as national identification number, passport number and/or tax identification number, together with copies of the corresponding identification documents), your residential address and correspondence address, financial information (such as your source(s) of income, source(s) of funds and source(s) of wealth, employment status, as well as your bank account details) and other information/documents as from time to time required by the Applicable Laws, our internal policies and procedures designed to ensure compliance with such Applicable Laws. Please note that if you do not provide us with such Personal Information as requested by us, we may not be able to provide to you our Services which you have requested or process any of your enquiries, instructions or requests.
            </p>

            <p>
              We will collect and use your Personal Information in accordance with applicable provisions of the PDPO, the guidelines, circulars and directives issued by the Privacy Commissioner for Personal Data (the "<strong className="text-white">Privacy Commissioner</strong>"), and any other applicable data protection laws, rules and regulations, in the manner set forth in this Privacy Policy. Any Personal Information obtained will be used by us solely for providing or facilitating the provision of our Services and will not be disclosed or made accessible to any third party except as provided by this Privacy Policy.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">2. Our collection of Personal Information</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-silver-200 mb-3">(a) Collected from the Users</h3>
                <p className="mb-4">
                  Log files and other technologies, data that servers, mobile and other computer devices typically make available, including your IP address and the associated geolocation, as well as other data which are generally not personal data, such as the browser type, domain name, operating system, language preference, referring site or the link which led you to our Website, and the date and time of each access request and length of each visit, are automatically collected through the use of cookies.
                </p>
                <p className="mb-4">
                  Our main purposes in collecting such data (including both personal data and other information) are to administer the Website; better understand how the Users use our Website by detecting usage patterns; provide information about developments and new products; detect for troubleshooting purposes; and monitor activities of the Users in order to detect any illegal, suspicious or prohibited behaviour, and prevent hacking and unauthorised access.
                </p>
                <p>
                  You may always refuse to supply such data by rejecting some or all of our cookies. However, this may result in certain features, functionalities or Services of the Website not being available to you. Please refer to Section 11 "Cookies" below for further information.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-silver-200 mb-3">(b) Provided by Users</h3>
                <p className="mb-3">
                  The Website and/or the Related Platforms may collect Personal Information (including Personal Information about the User and, where applicable, your User Parties) provided voluntarily by the Users when you use our Services on the Website and/or the Related Platforms, which may include, without limitation:
                </p>
                <ul className="list-none space-y-2 ml-6 mb-4">
                  <li>(i) completing and submitting the application form to open a user account with us on the Website and/or the Related Platforms ("<strong className="text-white">Account</strong>");</li>
                  <li>(ii) providing supporting information and documents in connection with your Account opening application;</li>
                  <li>(iii) authorising any of our Affiliates and our third-party partners and collaborators, or other third party to release your information, data and documents to us to provide the Services;</li>
                  <li>(iv) submitting any orders, requests or instructions or carrying out any transactions, through your Account;</li>
                  <li>(v) delivering our Services to you;</li>
                  <li>(vi) submitting an enquiry form or feedback form through the Website and/or the Related Platforms;</li>
                  <li>(vii) corresponding with us, whether via e-mail, telephone or any other means; and</li>
                  <li>(viii) when a problem is reported or a request for support is received.</li>
                </ul>
                <p>
                  Please note that if you do not provide such Personal Information, you may not be able to open an Account with us and/or may not be able to use or acquire some or all of our Services, and we may not be able to receive or process your requests, orders and instructions.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">3. Types of Personal Information</h2>

            <p className="mb-4">
              We collect the Personal Information you provide directly or indirectly to us when you visit our Website, when you carry out any of the activities referred to in Section 2 above or otherwise, as well as Personal Information which may be provided to us by third parties with your authorisation and personal data which may be available from public databases and other sources. Such Personal Information collected by us may, include, without limitation, the following:
            </p>

            <ul className="list-none space-y-2 ml-6 mb-4">
              <li>(a) Your contact information (e.g., name, email address, contact phone number, billing address, residential address, correspondence address, email address);</li>
              <li>(b) Tax identification number;</li>
              <li>(c) Gender;</li>
              <li>(d) Date and place of birth;</li>
              <li>(e) Nationality;</li>
              <li>(f) Identity verification documents (e.g., photograph, other information requested to verify your information, including copy of valid ID document or corporate documents);</li>
              <li>(g) Country/state of residence;</li>
              <li>(h) Your photo identification;</li>
              <li>(i) Your signature;</li>
              <li>(j) Purpose of account opening;</li>
              <li>(k) Username and password of the Account;</li>
              <li>(l) Total net wealth;</li>
              <li>(m) Initial and ongoing sources of wealth or income;</li>
              <li>(n) Source of funds/digital assets to be used for acquiring the Services from us;</li>
              <li>(o) Nature and details of the business/occupation/employment;</li>
              <li>(p) Level of activity anticipated;</li>
              <li>(q) Credit history and score;</li>
              <li>(r) Your transaction history and spending pattern;</li>
              <li>(s) Bank and credit account information;</li>
              <li>(t) Blockchain address;</li>
              <li>(u) Your location data;</li>
              <li>(v) Records of any bankruptcy, winding-up, liquidation or dissolution proceedings filed or commenced against you;</li>
              <li>(w) Records of any litigation, arbitration, administrative or other similar proceedings filed or commenced against you;</li>
              <li>(x) Criminal record (if any);</li>
              <li>(y) Any documentation proof for items (i) to (x) above (if applicable);</li>
              <li>(z) Other personal data collected through the use of cookies and other tracking technologies as described in Section 11 below; and</li>
              <li>(aa) Additional personal data or documentation at the discretion of our compliance team.</li>
            </ul>

            <p className="mb-4">
              Please be aware that we may collect personal data of your User Parties via your use of the Website or where you have given your consent. You shall be responsible for ensuring that the privacy rights of such User Parties in accordance with PDPO and the Applicable Laws, as well as any other terms and conditions governing data privacy and protection as between you and such User Parties, are observed and complied with, including but not limited to obtaining any prior authorisation or consent required for such disclosure and our collection, use, processing, retention and disclosure of such information in accordance with this Privacy Policy. Any such User Parties whose personal data or other information is provided by you to us shall be deemed to have accepted and agreed to this Privacy Policy.
            </p>

            <p>
              Further, you agree and undertake to indemnify, defend and hold us harmless from and against any losses, damages, costs, expenses, suits, actions, proceedings and third-party demands and claims arising from or in connection to your failure to obtain valid authorisation or consent or your breach of any term or condition applicable to your disclosure of personal data and any other information of any User Parties.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">4. Use of Personal Information</h2>

            <p className="mb-4">
              We will only collect, use, process and retain the personal data we collect for the purposes set out in this Privacy Policy. If you do not provide the Personal Information (including the personal data) requested, we may not be able to provide or continue to provide our Services to you. Your Personal Information (including the personal data, whether individually, or aggregated with the personal data of your User Parties) may be used for the following purposes:
            </p>

            <ul className="list-none space-y-2 ml-6 mb-4">
              <li>(a) To make decisions relating to the provision or continued provision of the Services to you;</li>
              <li>(b) To administer, operate, deliver, improve, and personalise the Website, Related Platforms and the Services;</li>
              <li>(c) To process your payments and transactions, and to provide you with statements, invoices, receipts and other related information in relation to the Services;</li>
              <li>(d) To monitor and record the usage of the Services and communications with you (including for investigation and fraud prevention purposes);</li>
              <li>(e) To detect, prevent and address technical issues;</li>
              <li>(f) For risk assessment and data analysis (including data processing, anti-money laundering and credit analyses), internal management and to carry out internal/external audits;</li>
              <li>(g) To communicate with you, your representatives and/or the User Parties in relation to the events, the Services, and other products or services offered by the Website, the Related Platforms, our Affiliates, and our third-party partners and collaborators, unless you have opted not to receive such information;</li>
              <li>(h) To conduct market research, surveys, promotions and contests, and to analyse your preferences, interests and behaviour in relation to the Services;</li>
              <li>(i) To fulfil any applicable legal, regulatory and compliance obligations and requirements, including but not limited to the AMLO;</li>
              <li>(j) To enforce the Terms;</li>
              <li>(k) To enforce or defend the rights or property of the Website, our Affiliates, our third-party partners and collaborators and other Users;</li>
              <li>(l) To carry out any other purpose(s) described to you at the time the data was collected; and</li>
              <li>(m) For any functions related to the foregoing.</li>
            </ul>

            <p className="mb-4">
              Where you provide to us Personal Information (including personal data) about another person, we shall be entitled to assume, conclusively and without enquiry, that the authorisation or consent of any such User Party, counterparty or third party as aforesaid has been obtained for the provision of his/her/its information to us and our collection, use, processing, retention and disclosure of such information in accordance with this Privacy Policy, and shall not in any event be responsible for any lack of authorisation or consent for the same.
            </p>

            <p>
              Further, you agree and undertake to indemnify, defend and hold us harmless from and against any losses, damages, costs, expenses, suits, actions, proceedings and third-party demands and claims arising from or in connection to your failure to obtain valid authorisation or consent or your breach of any term or condition applicable to your disclosure of Personal Information (including personal data) and any other information of any User Parties.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">5. Disclosure of Personal Information</h2>

            <p className="mb-4">
              Personal Information (including personal data) held by us will be kept confidential, but may be disclosed to the following persons for one or more of the purposes set out in Sections 2 and 4 of this Privacy Policy:
            </p>

            <ul className="list-none space-y-2 ml-6 mb-4">
              <li>(a) Our Affiliates, our third-party partners and collaborators who help us provide, operate, maintain, secure and improve the Website, Related Platforms and/or the Services (including but not limited to any issuance and payment services, know-your-customer (KYC), over-the-counter (OTC) transactions, custodian services, remittance services or other blockchain analytics service providers, credit card networks, banks or financial institutions, payment processors, merchants, loyalty programs partners, and service providers that provide website hosting, data analysis, information technology, mailing, telecommunications, human resource, data processing, payments, credit references or other services);</li>
              <li>(b) Any of our officers, employees, agents, contractors or third-party partners and collaborators who provide administrative, credit data, debt collection, telecommunications, client verification, due diligence, computing, payment, promotional, marketing or other services related to our business operations to us (e.g. IT vendors, electronic storage vendors);</li>
              <li>(c) Any financial institutions trading with or intending to trade with you, or any of your counterparties in a trade;</li>
              <li>(d) Any third-party agents, our third-party partners and collaborators or delegate which we may appoint or engage for the purpose of performing AML/CTF checks, screenings, analyses, review and monitoring;</li>
              <li>(e) Debt collection agencies for the purpose of collecting from you outstanding amounts owed by you to us in the event of delay or default upon your payment or repayment obligations under or in connection with the Terms;</li>
              <li>(f) Any persons or entities or data recipients who have already established or intend to establish any business relationship in relation to the Website and/or the Related Platforms;</li>
              <li>(g) Any relevant authorities (including but not limited to the Joint Financial Intelligence Unit and the Hong Kong Police Force), for the purpose of reporting suspicious transactions or illegal activities, whether in Hong Kong or other places;</li>
              <li>(h) Any agencies in Hong Kong or other competent jurisdictions for compliance with applicable laws, regulations, rules or guidelines regarding but not limited to the automatic exchange of financial account information and the Foreign Account Tax Compliance Act promulgated by the United States of America;</li>
              <li>(i) Any authorities and law enforcement agencies in furtherance of our legal, compliance, or regulatory obligations or to protect our legitimate interests, including our legal position, internal investigations, risk management procedures, or compliance with best practice, where you have provided your express consent by agreeing to our Terms and this Privacy Policy;</li>
              <li>(j) Other companies in the event of a corporate sale, merger, reorganisation, dissolution or similar event ("<strong className="text-white">Change of Control</strong>"), including but not limited to other businesses, counsel, investors, advisors, banking partners, and/or accountants in connection with any plan of Change of Control;</li>
              <li>(k) Anyone who refers you to us or whom you refer to us in connection to our Services; and</li>
              <li>(l) In any other cases, to such persons and for such purposes as authorised by you at the time the data was collected.</li>
            </ul>

            <p className="mb-4">
              With respect to the disclosure of the Personal Information (including personal data) to third parties as set out above, such information will only be used for the purposes for which it was disclosed, except as otherwise required or permitted by law. We strive to ensure that such third parties will be bound by terms no less protective of your personal data than those described in this Privacy Policy and in compliance with all applicable laws concerning data privacy and data protection, including but not limited to the PDPO and guidelines and directives issued by the Privacy Commissioner.
            </p>

            <p>
              Notwithstanding the foregoing, you agree and acknowledge that we will in no circumstances be liable or responsible for any data breach, unauthorised disclosure or mishandling by our Affiliates and any other third parties to which we may disclose your data in accordance with the provisions of this Privacy Policy.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">6. Transfer and storage of Personal Information</h2>

            <p className="mb-4">
              Your information, including Personal Information and personal data, may be transferred to, processed and maintained on computers in a foreign jurisdiction or foreign jurisdictions outside Hong Kong where the data protection laws may differ from those of Hong Kong. Under those circumstances, the governments, courts, law enforcement, or regulatory agencies of that jurisdiction or those jurisdictions may be able to obtain access to your Personal Information through foreign laws.
            </p>

            <p>
              However, we will take measures reasonably necessary to ensure that any such transfer complies with the Applicable Laws (and, to the extent applicable, those of other relevant jurisdictions) and that your personal data remains protected to the standards described in this Privacy Policy. Your submission of such information and your usage of our Website, the Related Platforms and/or the Services represent your agreement and consent to the transfer, storing or processing in accordance with this Privacy Policy, including transfers to jurisdictions outside Hong Kong as described herein. Where we transfer your information outside Hong Kong, we ensure that adequate safeguards are in place to treat your information securely and in accordance herewith. That includes, where necessary, taking steps to evaluate the risks raised by the transfers in jurisdictions that do not offer an adequate level of protection.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">7. Retention of Personal Information</h2>

            <p className="mb-4">
              For the purpose of compliance with the AMLO and other Applicable Laws, and to enable our provision of our Services to you, we will retain any Personal Information which you have provided to us or which we otherwise collect in accordance with this Privacy Policy throughout the continuance of your relationship with us and for a period of five (5) years after the termination of such business relationship, unless a longer period of retention is required by the Applicable Laws or any order, direction or request of the relevant authorities.
            </p>

            <p>
              After the expiration of said period, we will, unless prohibited by the Applicable Laws, delete and destroy the Personal Information held by us and take practicable measures to ensure that our Affiliates, agents, third-party partners and collaborators to which we have disclosed the Personal Information in accordance with this Privacy Policy do the same.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">8. How we protect Personal Information</h2>

            <p className="mb-4">
              We implement protective measures on the Website to safeguard and secure Personal Information to ensure it is protected against unauthorised or accidental access, processing, or erasure. These measures include the following:
            </p>

            <ul className="list-none space-y-2 ml-6 mb-4">
              <li>(a) access or use of the Personal Information is limited to authorised staff or agents on a "need-to-know" basis and such Personal Information is accessed utilising secured methods (e.g. personal data is encrypted when necessary);</li>
              <li>(b) we do not distribute the Personal Information to other persons except to the classes of transferees set out in this Privacy Policy and for the purposes set out in this Privacy Policy (including but not limited to Sections 2 and 5);</li>
              <li>(c) the use and transfer of the Personal Information is subject to strict internal security standards, confidentiality policies, privacy laws and other Applicable Laws;</li>
              <li>(d) we ensure that our employees fully comply with such standards, policies and laws; and</li>
              <li>(e) we provide training to our staff on the proper handling of the Personal Information.</li>
            </ul>

            <p className="mb-4">
              All Personal Information you provide to us will be stored on our secure servers. It is your sole responsibility to maintain the confidentiality and security of your device and your Account credentials and not share them with anyone (other than your authorised representatives). We shall not be liable for any damage, loss or expense suffered due to your disclosure of such confidential information.
            </p>

            <p>
              As we further develop new services and products, we will continue to make every effort to ensure that the Personal Information is properly used and protected.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">9. Direct Marketing</h2>

            <p className="mb-4">
              From time to time, we may use the Personal Information (including your personal data) to send you news, updates, offers, promotions and joint marketing offers relating to our Website, Related Platforms, Services, or other new services or products and facilities provided or offered by us and our Affiliates and other business partners. Your consent is required for the use of your personal data for such purposes. We may contact you by email, in-Website/Related Platforms notifications, telephone, SMS, Whatsapp, WeChat, other text/picture/video messaging channels, social media, or mail.
            </p>

            <p className="mb-4">
              Your name, email address, telephone number, contact address, social media contact, date of birth, as well as information about your subscriptions, products and services portfolio, transaction and activity patterns and behaviors, browsing records, content viewing habits and personal interests held by us may be used by us in direct marketing (as defined in the PDPO) of our Services and any new or existing services, products and facilities offered by us, our Affiliates and business partners, including but not limited to: money or virtual asset exchange or trading services (including but not limited to OTC transactions), asset custody solutions and services, pre-paid cards, credit cards, debit cards, credit facilities, financial products, investment products and services, as well as other similar products, services and facilities.
            </p>

            <p className="mb-4">
              By entering into the Terms and accepting this Privacy Policy, you will be deemed to have consented to the use of your personal data for direct marketing purposes in accordance with this Section 9, unless you expressly indicate to us your objection to such use.
            </p>

            <p className="mb-4">
              If you prefer not to receive any direct marketing communications from us or our marketing partners, you may indicate the same when submitting your Account opening application or withdraw your consent to the use and provision of your personal data for direct marketing at any time thereafter by updating your preferences through your registered Account or by email to us at <a href="mailto:info@silvertimes.io" className="text-blue-400 hover:text-blue-300 transition-colors">info@silvertimes.io</a>. Upon actual receipt of your request, we shall cease to use your personal data as soon as practicable without charge to you.
            </p>

            <p>
              However, you may not opt-out of administrative communications (e.g. emails about your transactions or policy changes) for your Account or subscriptions to any our means of communication mentioned hereabove.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">10. Your rights of access and correction regarding your personal data</h2>

            <p className="mb-4">
              According to and in accordance with the PDPO, you may have the right to:
            </p>

            <ul className="list-none space-y-2 ml-6 mb-4">
              <li>(a) Request access to the personal data we process about you;</li>
              <li>(b) Request us to correct, update, shield your personal data that is no longer correct in our records;</li>
              <li>(c) Request a copy of the personal data we have processed about you;</li>
              <li>(d) Request us to inform you of the type of personal data held by us;</li>
              <li>(e) Object to the processing of your personal data and request us to cease processing of it;</li>
              <li>(f) Ask us to suspend the processing of your personal data; and</li>
              <li>(g) Withdraw your consent to process your personal data.</li>
            </ul>

            <p className="mb-4">
              In accordance with the PDPO, we reserve the right to charge a reasonable fee for processing any data request on a per request basis, as may be notified to you via publication or posting on the Website or any other means for the giving of notices and communications in accordance with the Terms. Nothing in this Privacy Policy shall limit your rights under the PDPO.
            </p>

            <p className="mb-4">
              You shall send a written email request to us with the contact information as provided in Section 13 of this Privacy Policy. Please indicate your name, account/user number and contact number registered on the Website for us to follow up with your request. You may be asked to provide additional information to authenticate your identity in order for us to follow up on your request.
            </p>

            <p>
              We have a right to refuse to comply with your data access/correction request under the circumstances set out in the PDPO. For example, where the description of the personal data requested is so generic that it is impracticable for us to identify the relevant data, we are entitled to refuse the request if you are unable to provide sufficient additional information to enable us to process it. We shall provide to you a written notice of such refusal with reasons within 40 days of receipt of the data access/correction request.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">11. Cookies</h2>

            <p className="mb-4">
              We use cookies and other technologies to track and collect information of the Users. Cookies are small data files placed on your device or terminal. They are used to track and collect information including but not limited to your browsing information from your web browser, information about your computer or device, operating system and their settings, and the details of your visit. They use such information during your future visits to our Website and/or the Related Platforms, so that the server may immediately recognise that you have been to the Website and/or the Related Platforms before.
            </p>

            <p className="mb-4">
              Our cookies will not destroy any files in your electronic devices, but are only used to track information such as the User's IP address, which pages have been visited, and the duration or each visit and frequency of visits, as well as the activity patterns, habits and preferences of visitors. We do not use cookies to track the identity of the actual user (other than his or her IP address), and cookies will only tell if a certain computer or device has visited our website in the past. For example, your name, email address and mobile phone number will not be collected by the cookies deployed on our Website. Note that you may encounter cookies or tracking technologies from our third-party service providers that we have allowed on our Website and/or the Related Platforms which assist us with various aspects of their operations and services.
            </p>

            <p>
              If you visit our Website and/or the Related Platforms, and that your computer or mobile settings accept cookies, we will consider this as acceptance of our use of cookies. If you do not wish to permit such tracking and information collection by our cookies, you may adjust the settings in your web browser to reject some or all of our cookies. However, we offer certain features that are available only through the use of cookies and other tracking technologies. Rejection to some or all of our cookies may prevent you from accessing or using some or all of the features, functionalities and services of our Website.
            </p>
          </div>

          {/* Section 12 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">12. Amendments to this Privacy Policy</h2>

            <p className="mb-4">
              We may amend, modify, update or supplement this Privacy Policy from time to time as we in our sole and absolute discretion consider necessary or appropriate. When there is any change to this Privacy Policy, we will publish the revised version of this Privacy Policy or a supplemental document on our Website and/or the Related Platforms. Such amendments, modifications, updates and supplementations are considered part of the Privacy Policy, shall have the same force and effect as this Privacy Policy and will be effective from the date we publish them on our Website and/or the Related Platforms. If you continue using our Website, the Related Platforms and/or the Services after such amendments, modifications, updates and supplementations take effect, you are deemed to have accepted the revised or updated Privacy Policy and be bound by it accordingly.
            </p>

            <p>
              We recommend that you read and understand this Privacy Policy from time to time to better understand the policies that you are obligated to comply with. If you do not agree to the provisions of this Privacy Policy, please cease to immediately close your Account and cease to use our Website, the Related Platforms and/or the Services.
            </p>
          </div>

          {/* Section 13 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">13. Contact us</h2>

            <p>
              If you have any questions about this Privacy Policy, or if you want to exercise your rights regarding Personal Information as set out in Section 10 of this Privacy Policy, please contact us at <a href="mailto:info@silvertimes.io" className="text-blue-400 hover:text-blue-300 transition-colors">info@silvertimes.io</a>. We will review questions as soon as possible and reply to you within a reasonable time period. You may be requested to provide additional information in relation to your question(s) or request(s).
            </p>
          </div>

          {/* Section 14 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">14. Links to other sites</h2>

            <p>
              Our Website may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the privacy policy of every site you visit. You understand we have no control over and assume no responsibility for the content, privacy policies or practices of any third-party sites or services. If you directly provide any data or information to such third parties, we make no commitment or assume any responsibility regarding the security of such data and the compliance with data processing.
            </p>
          </div>

          {/* Section 15 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">15. Liability</h2>

            <p>
              We shall in no event be liable to you in respect of any claims, losses, damages, expenses (including any legal fees) arising out of or in connection with the use, processing, retention or and/or disclosure or dissemination of any data or information in accordance with this Privacy Policy and any consents or authorisations that you may have otherwise provided to us.
            </p>
          </div>

          {/* Section 16 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">16. Governing law and jurisdiction</h2>

            <p>
              This Privacy Policy shall be governed by and construed in accordance with the laws of Hong Kong. Any dispute, controversy, difference or claim arising out of or relating to this Privacy Policy, including the existence, validity, interpretation, performance, breach or termination of the terms hereof or any dispute regarding any non-contractual obligations arising out of or relating to this Privacy Policy, shall be referred to and finally resolved by arbitration administered by the Hong Kong International Arbitration Centre ("<strong className="text-white">HKIAC</strong>") under the HKIAC Administered Arbitration Rules in force when the Notice of Arbitration is submitted. The law of this arbitration clause shall be Hong Kong law. The seat of arbitration shall be Hong Kong. The number of arbitrators shall be one. The arbitration proceedings shall be conducted in English.
            </p>
          </div>

          {/* Last Updated */}
          <div className="pt-6 border-t border-white/5 mt-8">
            <p className="text-xs text-silver-500 italic">
              Last updated on 28 January 2026.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

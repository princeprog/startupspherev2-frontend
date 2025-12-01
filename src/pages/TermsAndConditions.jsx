import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, AlertCircle, Shield, Scale, Users } from "lucide-react";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50 border-b border-base-300">
        <div className="max-w-6xl mx-auto w-full px-4">
          <div className="flex-none">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm gap-2 hover:bg-primary hover:text-primary-content"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex-1 ml-4">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Terms and Conditions</h1>
                <p className="text-xs opacity-60">Capstone Project | Last Updated: December 1, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        {/* Important Notice */}
        <div role="alert" className="alert alert-warning shadow-lg mb-8">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Academic Capstone Project Notice</h3>
            <p className="text-sm mt-1">
              <strong>StartupSphere is a capstone project developed for educational purposes.</strong> This platform serves as a demonstration of web development capabilities and is not a commercial service. By using this platform, you acknowledge its academic nature. Data submitted may be used solely for project evaluation and demonstration purposes.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-6 lg:p-10 space-y-10">
            {/* Section 1 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" defaultChecked /> 
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">1</div>
                <span>Acceptance of Terms</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p>
                  <strong>StartupSphere is an academic capstone project</strong> created for educational and demonstration purposes. By creating an account, you acknowledge that this is not a commercial platform and any data you provide is for academic evaluation only. You understand that this platform is a student project and not intended for actual business operations.
                </p>
                <p>
                  As this is a capstone project, terms may be updated as the project evolves. The platform is provided for educational demonstration and is not intended to replace professional startup management or business services.
                </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">
                  <Users className="h-4 w-4" />
                </div>
                <span>User Accounts and Registration</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p className="font-medium text-gray-900">Account Creation (Academic Project)</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Accounts are created solely for testing and demonstrating the capstone project</li>
                  <li>You understand this is not a real commercial service</li>
                  <li>Information provided should be for demonstration purposes only</li>
                  <li>You are responsible for your account credentials during the project evaluation period</li>
                  <li>Accounts may be removed after the capstone project completion</li>
                </ul>
                <p className="font-medium text-gray-900 mt-4">Project Duration</p>
                <p>
                  As this is a capstone project, the platform is available during the academic period and may be discontinued after project evaluation. Accounts and data may be removed or archived after the project concludes.
                </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">
                  <Shield className="h-4 w-4" />
                </div>
                <span>Startup Information and Data</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p className="font-medium text-gray-900">Academic Demonstration Data</p>
                <p>
                  This platform is designed to demonstrate startup data management capabilities. Users may input sample or real startup information for demonstration purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Company information is used solely for project demonstration</li>
                  <li>Data entered is for academic evaluation and testing</li>
                  <li>No business transactions or actual services are provided</li>
                  <li>Information shared is visible to project evaluators and testers</li>
                  <li>Data may be used in project presentations and documentation</li>
                </ul>
                <p className="font-medium text-gray-900 mt-4">No Legal or Business Services</p>
                <p>
                  This capstone project does not provide legal verification, business registration, or professional services. Features demonstrating government registration integration (DTI, DOST, DICT) are for educational purposes only and do not constitute actual registration or verification services.
                </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">4</div>
                <span>Intellectual Property Rights</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p className="font-medium text-gray-900">Academic Project Ownership</p>
                <p>
                  StartupSphere is a capstone project created for educational purposes. The platform code, design, and features are part of an academic submission. Content and demonstrations are used solely for educational evaluation.
                </p>
                <p className="font-medium text-gray-900 mt-4">Demonstration Content</p>
                <p>
                  By uploading content to this academic platform, you understand it may be used in project presentations, documentation, and demonstrations for educational purposes. You retain ownership of your content, and it will be used only within the scope of this capstone project evaluation.
                </p>
                <p className="font-medium text-gray-900 mt-4">Restrictions</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may not reproduce, distribute, or create derivative works from our platform content without permission</li>
                  <li>You may not use our trademarks, logos, or branding without written consent</li>
                  <li>You may not reverse engineer or attempt to extract source code from our platform</li>
                </ul>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">5</div>
                <span>Prohibited Activities</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p>Users are strictly prohibited from:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Posting false, misleading, or fraudulent information about startups</li>
                  <li>Impersonating another person or entity</li>
                  <li>Uploading malicious code, viruses, or harmful software</li>
                  <li>Attempting to gain unauthorized access to the platform or other users' accounts</li>
                  <li>Harassing, threatening, or abusing other users</li>
                  <li>Scraping or collecting data from the platform without permission</li>
                  <li>Using the platform for illegal activities or purposes</li>
                  <li>Spamming or sending unsolicited commercial communications</li>
                  <li>Violating any applicable local, national, or international laws</li>
                </ul>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">
                  <Scale className="h-4 w-4" />
                </div>
                <span>Limitation of Liability</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p className="font-medium text-gray-900">Academic Project Status</p>
                <p>
                  <strong>This is a student capstone project, not a commercial service.</strong> The platform is provided for educational demonstration only, without any warranties. As an academic project, it may have bugs, limitations, or downtime. It is not intended for actual business use or critical operations.
                </p>
                <p className="font-medium text-gray-900 mt-4">No Professional Services</p>
                <p>
                  This platform does not provide professional business services, legal advice, or commercial support. Information displayed is for demonstration purposes. Do not make business decisions based on this academic project.
                </p>
                <p className="font-medium text-gray-900 mt-4">Educational Purpose Only</p>
                <p>
                  This capstone project is created for academic evaluation. No liability is assumed for any use beyond educational demonstration. The platform is not responsible for any outcomes related to information shared on this academic project.
                </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">7</div>
                <span>Privacy and Data Protection</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p>
                  As an academic capstone project, data collected is used solely for educational purposes and project evaluation. Our Privacy Policy describes how demonstration data is handled. By using this platform, you understand your data is part of an academic project.
                </p>
                <p>
                  While we implement basic security measures appropriate for a student project, this is not a commercial platform with enterprise-level security. Do not submit sensitive or confidential business information.
                </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">8</div>
                <span>Governing Law and Dispute Resolution</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p>
                  These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes arising from or relating to these terms shall be subject to the exclusive jurisdiction of the courts of the Philippines.
                </p>
                <p className="font-medium text-gray-900 mt-4">Dispute Resolution</p>
                <p>
                  In the event of any dispute, controversy, or claim arising from these terms, the parties agree to first attempt to resolve the matter through good faith negotiation. If resolution cannot be reached within 30 days, the matter may be submitted to mediation or arbitration before resorting to litigation.
                </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">9</div>
                <span>Contact Information</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                  <p>
                    If you have any questions, concerns, or complaints regarding these Terms and Conditions, please contact us at:
                  </p>
                  <div className="stats shadow mt-4 bg-base-300">
                    <div className="stat">
                      <div className="stat-title">Capstone Project Contact</div>
                      <div className="stat-value text-lg">Project Team</div>
                      <div className="stat-desc">Academic Project - For evaluation purposes</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section className="collapse collapse-arrow bg-base-200 rounded-box">
              <input type="checkbox" />
              <div className="collapse-title text-xl font-bold flex items-center gap-3">
                <div className="badge badge-primary badge-lg">10</div>
                <span>Miscellaneous</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4">
                <p className="font-medium text-gray-900">Severability</p>
                <p>
                  If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
                </p>
                <p className="font-medium text-gray-900 mt-4">Entire Agreement</p>
                <p>
                  These Terms and Conditions, together with the Privacy Policy, constitute the entire agreement between you and StartupSphere regarding your use of the platform.
                </p>
                <p className="font-medium text-gray-900 mt-4">No Waiver</p>
                <p>
                  Our failure to enforce any right or provision of these terms shall not be deemed a waiver of such right or provision.
                </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Agreement Footer */}
        <div role="alert" className="alert alert-info shadow-lg mt-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <p className="font-bold">Academic Capstone Project Disclaimer</p>
            <p className="text-sm">By using StartupSphere, you acknowledge this is a student capstone project for educational purposes only. This is not a commercial platform or professional service. Data submitted is for academic evaluation and demonstration.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

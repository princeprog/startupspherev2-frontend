import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Bell } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto w-full px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {window.close();
                              navigate("/");
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-3 py-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <div className="rounded-full w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Privacy Policy</h1>
                <p className="text-xs text-gray-500">Capstone Project | Last Updated: December 1, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
        {/* Introduction */}
        <div className="mb-8 rounded-lg border border-gray-100 bg-yellow-400 shadow-sm p-5 flex items-start gap-4">
          <div className="text-blue-500">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Academic Capstone Project - Privacy Notice</h3>
            <p className="text-sm text-gray-600 mt-1">
              <strong>StartupSphere is an academic capstone project</strong> created for educational purposes. This Privacy Policy explains how data is handled within this student project. Data collected is used solely for project demonstration and evaluation.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
          <div className="p-6 lg:p-10 space-y-10">
            {/* Section 1 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <Database className="h-4 w-4" />
                </div>
                <span>Information We Collect</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                  <div>
                    <p className="font-medium text-gray-900 mb-2">Academic Project Data Collection</p>
                    <p className="mb-2">For this capstone project demonstration, we collect:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Basic account information (name, email) for testing purposes</li>
                      <li>Test passwords (stored with basic encryption)</li>
                      <li>Optional profile information for demonstration</li>
                      <li><strong>Note:</strong> Do not use sensitive or real personal data</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">Demonstration Startup Data</p>
                    <p className="mb-2">Sample startup information collected for project features:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Company information (for demonstration purposes)</li>
                      <li>Sample business details and descriptions</li>
                      <li>Test location and contact data</li>
                      <li>Mock funding and registration information</li>
                      <li>Images and files uploaded for testing</li>
                      <li><strong>All data is used for academic evaluation only</strong></li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium text-gray-900 mb-2">Usage Data</p>
                    <p className="mb-2">We automatically collect:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent on the platform</li>
                      <li>Startup views, likes, and bookmarks</li>
                      <li>Search queries and filters used</li>
                      <li>Interaction with map features</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                </div>
                <span>How We Use Your Information</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                <p>As a capstone project, data is used exclusively for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Project Demonstration:</strong> Showcase platform features and capabilities</li>
                  <li><strong>Academic Evaluation:</strong> Allow instructors and evaluators to test functionality</li>
                  <li><strong>Feature Testing:</strong> Demonstrate user account management, startup listings, and map visualization</li>
                  <li><strong>Project Presentation:</strong> Include in project documentation and demonstrations</li>
                  <li><strong>Educational Purpose:</strong> Demonstrate technical skills and implementation</li>
                  <li><strong>No Commercial Use:</strong> Data is never used for business or commercial purposes</li>
                  <li><strong>Limited Retention:</strong> Data may be removed after project evaluation concludes</li>
                </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" defaultChecked />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <Users className="h-4 w-4" />
                </div>
                <span>Information Sharing and Disclosure</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                <div>
                  <p className="font-medium text-gray-900 mb-2">Academic Project Data Visibility</p>
                  <p>
                    Information submitted is visible to other users, project evaluators, and instructors for demonstration purposes. This capstone project is designed to showcase a startup ecosystem platform, so data is displayed publicly within the project environment.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-2">No Commercial Data Usage</p>
                  <p>
                    This is a student project - we do not sell, trade, or commercially exploit any data. Information is used solely for academic purposes.
                  </p>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-2">Project Evaluation Access</p>
                  <p className="mb-2">Data may be accessed by:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Project Team:</strong> Students developing and maintaining the capstone project</li>
                    <li><strong>Academic Evaluators:</strong> Instructors and faculty assessing the project</li>
                    <li><strong>Testers:</strong> Individuals testing the platform during the academic period</li>
                    <li><strong>Presentation Audience:</strong> Data may be shown in project demonstrations</li>
                  </ul>
                </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <Lock className="h-4 w-4" />
                </div>
                <span>Data Security</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                  <p>
                    As a student capstone project, we implement basic security measures appropriate for an academic demonstration:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 not-prose">
                    <div className="rounded-md border border-gray-100 bg-blue-50/50 p-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-800"><Lock className="h-4 w-4 text-blue-400" />Encryption</h4>
                      <p className="text-sm text-gray-600 mt-1">All data transmitted between your device and our servers is encrypted using SSL/TLS protocols</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-blue-50/50 p-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-800"><Shield className="h-4 w-4 text-blue-400" />Access Control</h4>
                      <p className="text-sm text-gray-600 mt-1">Strict access controls ensure only authorized personnel can access sensitive data</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-blue-50/50 p-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-800"><Database className="h-4 w-4 text-blue-400" />Secure Storage</h4>
                      <p className="text-sm text-gray-600 mt-1">Passwords are hashed and salted; sensitive data is encrypted at rest</p>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-blue-50/50 p-4">
                      <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-800"><Eye className="h-4 w-4 text-blue-400" />Regular Audits</h4>
                      <p className="text-sm text-gray-600 mt-1">Continuous security monitoring and regular vulnerability assessments</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-md border border-blue-50 bg-blue-50/60 p-4 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-blue-400 flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-sm text-gray-700"><strong>Important:</strong> This is a student capstone project with basic security measures for academic demonstration. Do not submit sensitive, confidential, or critical business information. Use test data or information you're comfortable sharing in an academic context.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">5</div>
                <span>Your Rights</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                  <p>
                    As participants in this academic capstone project, you have the following rights:
                  </p>
                  <div className="space-y-3 mt-4 not-prose">
                    <div className="rounded-md border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800">Right to Access</h4>
                        <p className="text-xs text-gray-600">View and obtain copies of your personal data we hold</p>
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800">Right to Correction</h4>
                        <p className="text-xs text-gray-600">Request correction of inaccurate or incomplete information</p>
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800">Right to Erasure</h4>
                        <p className="text-xs text-gray-600">Request deletion of your personal data (subject to legal obligations)</p>
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800">Right to Object</h4>
                        <p className="text-xs text-gray-600">Object to processing of your data for certain purposes</p>
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800">Right to Data Portability</h4>
                        <p className="text-xs text-gray-600">Receive your data in a structured, commonly used format</p>
                      </div>
                    </div>
                    <div className="rounded-md border border-gray-100 bg-gray-50 shadow-sm">
                      <div className="p-3">
                        <h4 className="font-semibold text-sm text-gray-800">Right to Withdraw Consent</h4>
                        <p className="text-xs text-gray-600">Withdraw your consent to data processing at any time</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4">
                    To exercise any of these rights, please contact the <strong>project team during the academic period</strong>. Note that data may be retained for project evaluation purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <Bell className="h-4 w-4" />
                </div>
                <span>Cookies and Tracking</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                <p>
                  StartupSphere uses cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Essential Cookies:</strong> Required for authentication and platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. Note that disabling certain cookies may limit platform functionality.
                </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">7</div>
                <span>Data Retention</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                <p>
                  As a capstone project, data is retained during the academic period for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Project demonstration and evaluation</li>
                  <li>Academic assessment and grading</li>
                  <li>Project documentation and presentation</li>
                  <li>Testing and debugging during development</li>
                </ul>
                <p>
                  <strong>After the project concludes</strong>, all accounts and data may be archived or removed. This platform operates only during the academic period and is not intended for long-term data storage.
                </p>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">8</div>
                <span>Children's Privacy</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                <p>
                  StartupSphere is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately so we can remove it.
                </p>
                </div>
              </div>
            </section>

            {/* Section 9 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">9</div>
                <span>Changes to This Policy</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes by:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Posting the updated policy on this page</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending an email notification for material changes</li>
                </ul>
                <p>
                  Your continued use of StartupSphere after changes are posted constitutes acceptance of the updated policy.
                </p>
                </div>
              </div>
            </section>

            {/* Section 10 */}
            <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
              <input type="checkbox" />
              <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">10</div>
                <span>Contact Us</span>
              </div>
              <div className="collapse-content">
                <div className="prose max-w-none pt-4 text-gray-800">
                  <p>
                    For questions, concerns, or requests regarding your privacy or this policy, please contact:
                  </p>
                  <div className="stats stats-vertical lg:stats-horizontal shadow mt-4 bg-gray-50 border border-gray-100 not-prose">
                    <div className="stat">
                      <div className="stat-figure text-secondary">
                        <Shield className="h-8 w-8" />
                      </div>
                      <div className="stat-title text-xs">Project Team</div>
                      <div className="stat-value text-sm">Capstone Project</div>
                      <div className="stat-desc">Academic demonstration</div>
                    </div>
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                      </div>
                      <div className="stat-title text-xs">Project Period</div>
                      <div className="stat-value text-sm">Academic Term</div>
                      <div className="stat-desc">For evaluation purposes</div>
                    </div>
                    <div className="stat">
                      <div className="stat-figure text-accent">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      </div>
                      <div className="stat-title text-xs">Response Time</div>
                      <div className="stat-value text-sm">48 Hours</div>
                      <div className="stat-desc">Maximum response time</div>
                    </div>
                  </div>
                  <div role="alert" className="mt-4 rounded-md border border-yellow-100 bg-yellow-50/60 p-4 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-yellow-400 flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <span className="text-sm text-gray-700"><strong>Academic Project Notice:</strong> For concerns about this capstone project, contact the project team or academic supervisor. This is not a commercial platform subject to standard regulatory oversight.</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 rounded-lg border border-green-50 bg-white p-5 shadow-sm flex items-start gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-green-400 flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <p className="font-semibold text-gray-800">Academic Capstone Project</p>
            <p className="text-sm text-gray-600">This is a student project created for educational purposes. Data handling practices are designed for academic demonstration. Use test or sample data only. Thank you for supporting this capstone project!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

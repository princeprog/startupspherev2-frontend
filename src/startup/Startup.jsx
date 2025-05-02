import { useNavigate } from "react-router-dom";

export default function Startup() {

  const navigate = useNavigate()
  return (
    <div className=" flex flex-col items-center justify-center h-screen">
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Startup</th>
              <th>Location</th>
              <th>Industry</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="mask mask-squircle h-12 w-12">
                      <img
                        src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                        alt="Avatar Tailwind CSS Component"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">Hart Hagerty</div>
                    <div className="text-sm opacity-50">United States</div>
                  </div>
                </div>
              </td>
              <td>
                Zemlak, Daniel and Leannon
                <br />
                <span className="badge badge-ghost badge-sm">
                  Desktop Support Technician
                </span>
              </td>
              <td>Purple</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th></th>
              <th>Startup</th>
              <th>Location</th>
              <th>Location</th>
            </tr>
          </tfoot>
        </table>
        <div className="flex justify-end">
          <button className="btn"
            onClick={()=>navigate("/add-startup")}
          >Add startup</button>
        </div>
      </div>
    </div>
  );
}

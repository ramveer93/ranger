/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { useState, useEffect } from "react";
import AccessLogsTable from "./AccessLogsTable";
import { PolicyViewDetails } from "./AdminLogs/PolicyViewDetails";
import { fetchApi } from "Utils/fetchAPI";
import { toast } from "react-toastify";
import { isEmpty } from "lodash";
import { Loader } from "Components/CommonComponents";
import { useParams } from "react-router-dom";

function AccessLogDetail(props) {
  const params = useParams();
  const [access, setAccess] = useState([]);
  const [serviceDefs, setServiceDefs] = useState([]);
  const [loader, setLoader] = useState(true);

  useEffect(() => {
    fetchServiceDefs();
    fetchAcessLogs();
  }, []);
  const fetchServiceDefs = async () => {
    let serviceDefsResp = [];
    try {
      serviceDefsResp = await fetchApi({
        url: "plugins/definitions"
      });
    } catch (error) {
      console.error(
        `Error occurred while fetching Service Definitions or CSRF headers! ${error}`
      );
    }

    setServiceDefs(serviceDefsResp.data.serviceDefs);
    setLoader(false);
  };
  const fetchAcessLogs = async () => {
    let accessResp;
    let accessData;

    try {
      accessResp = await fetchApi({
        url: `assets/accessAudit`,
        params: {
          eventId: params.eventId
        }
      });
    } catch (error) {
      console.error(
        `Error occurred while fetching Access or CSRF headers! ${error}`
      );
      toast.error(error.response.data.msgDesc);
    }
    if (!isEmpty(accessResp)) {
      accessResp.data.vXAccessAudits.map((obj) => {
        accessData = obj;
      });
    }
    setAccess(accessData);
    setLoader(false);
  };

  return (
    <>
      {loader ? (
        <Loader />
      ) : (
        <>
          <h4>
            {params.eventId !== undefined
              ? "Ranger – audit log"
              : "Audit Access Log Detail"}
          </h4>
          <div className="wrap">
            <AccessLogsTable data={access}></AccessLogsTable>
          </div>
          {access.policyId != -1 && (
            <>
              <h4>Policy Details</h4>
              <div className="wrap">
                <PolicyViewDetails
                  paramsData={access}
                  serviceDef={serviceDefs?.find((servicedef) => {
                    return servicedef.name == access.serviceType;
                  })}
                  policyView={false}
                />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export default AccessLogDetail;

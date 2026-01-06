package com.blockchain.EHR;

import com.blockchain.EHR.controller.PatientController;
import com.blockchain.EHR.jwt.JwtUtils;
import com.blockchain.EHR.model.EhrDocument;
import com.blockchain.EHR.model.Pending;
import com.blockchain.EHR.model.Transaction;
import com.blockchain.EHR.services.EhrService;
import com.blockchain.EHR.services.PatientService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PatientController.class)
@AutoConfigureMockMvc(addFilters = false)
class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtUtils jwtUtils;
    @MockBean
    private PatientService patientService;
    @MockBean
    private com.blockchain.EHR.repository.PatientRepository patientRepository;
    @MockBean
    private com.blockchain.EHR.repository.PendingRepository pendingRepository;
    @MockBean
    private EhrService ehrService;

    private final String jwt = "mocked-jwt";
    private final String pid = "patient1";
    private final String mspId = "Org2MSP";

    private void mockJwt() {
        Mockito.when(jwtUtils.getJwtFromHeader(any())).thenReturn(jwt);
        Mockito.when(jwtUtils.getUserNameFromJwtToken(jwt)).thenReturn(pid);
        Mockito.when(jwtUtils.getMspIdFromJwtToken(jwt)).thenReturn(mspId);
    }

    @Test
    @DisplayName("GET /fabric/patient/accepted")
    void testGetAcceptedDoctors() throws Exception {
        mockJwt();
        List<Pending> accepted = Collections.singletonList(new Pending());
        Mockito.when(patientService.getDoctors(eq(pid), eq(mspId))).thenReturn(accepted);

        mockMvc.perform(get("/fabric/patient/accepted")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(patientService).getDoctors(eq(pid), eq(mspId));
    }

    @Test
    @DisplayName("GET /fabric/patient/view-ehr")
    void testViewEhr() throws Exception {
        mockJwt();
        EhrDocument ehrDocument = new EhrDocument();
        Mockito.when(ehrService.getEhrDocumentForPatient(eq(pid), eq(mspId))).thenReturn(ehrDocument);

        mockMvc.perform(get("/fabric/patient/view-ehr")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(ehrService).getEhrDocumentForPatient(eq(pid), eq(mspId));
    }

    @Test
    @DisplayName("GET /fabric/patient/revoked")
    void testGetRevokedDoctors() throws Exception {
        mockJwt();
        List<String> revoked = Collections.singletonList("doctor1");
        Mockito.when(patientService.getRevokedDoctors(eq(pid), eq(mspId))).thenReturn(revoked);

        mockMvc.perform(get("/fabric/patient/revoked")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(patientService).getRevokedDoctors(eq(pid), eq(mspId));
    }

    @Test
    @DisplayName("GET /fabric/patient/request")
    void testGetPendingRequests() throws Exception {
        mockJwt();
        List<Pending> pendings = Collections.singletonList(new Pending());
        Mockito.when(patientService.getPendingRequest(eq(pid))).thenReturn(pendings);

        mockMvc.perform(get("/fabric/patient/request")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(patientService).getPendingRequest(eq(pid));
    }

    @Test
    @DisplayName("POST /fabric/patient/request/{did}")
    void testUpdatePendingRequest() throws Exception {
        mockJwt();
        Mockito.doNothing().when(patientService).updateStatus(eq(pid), eq("doctor1"), eq("Accepted"), eq(mspId));

        mockMvc.perform(post("/fabric/patient/request/doctor1")
                .param("status", "Accepted")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(patientService).updateStatus(eq(pid), eq("doctor1"), eq("Accepted"), eq(mspId));
    }

    @Test
    @DisplayName("GET /fabric/patient/history/{did}")
    void testGetDoctorHistory() throws Exception {
        mockJwt();
        List<Transaction> transactions = Collections.singletonList(new Transaction());
        Mockito.when(patientService.getHistory(eq(pid), eq("doctor1"), eq(mspId))).thenReturn(transactions);

        mockMvc.perform(get("/fabric/patient/history/doctor1")
                .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());
        Mockito.verify(patientService).getHistory(eq(pid), eq("doctor1"), eq(mspId));
    }
}

package com.blockchain.EHR;

import com.blockchain.EHR.controller.FabricController;
import com.blockchain.EHR.jwt.CustomUsernamePasswordAuthenticationToken;
import com.blockchain.EHR.jwt.JwtUtils;
import com.blockchain.EHR.services.EhrService;
import com.blockchain.EHR.services.FabricService;
import com.blockchain.EHR.services.FabricUserRegistration;
import com.blockchain.EHR.services.UserInfoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FabricController.class)
@AutoConfigureMockMvc(addFilters = false)
class FabricControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EhrService ehrService;
    @MockBean
    private FabricService fabricService;
    @MockBean
    private UserInfoService userInfoService;
    @MockBean
    private JwtUtils jwtUtils;
    @MockBean
    private AuthenticationManager authenticationManager;
    @MockBean
    private FabricUserRegistration fabricUserRegistration;

    private static String doctorJwtToken;
    private static String patientJwtToken;

    @Test
    @DisplayName("Admin login for Org1MSP")
    void testAdminLoginOrg1MSP() throws Exception {
        String username = "admin";
        String password = "adminpw";
        String mspId = "Org1MSP";
        String jwtToken = "mocked-jwt-token-org1";

        // Mock authentication
        Authentication mockAuth = Mockito.mock(Authentication.class);
        Mockito.when(authenticationManager.authenticate(any(CustomUsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        Mockito.when(mockAuth.isAuthenticated()).thenReturn(true);
        Mockito.when(jwtUtils.generateTokenFromUserDetails(eq(username), eq(mspId))).thenReturn(jwtToken);

        String requestBody = String.format("{\"username\":\"%s\",\"password\":\"%s\",\"mspId\":\"%s\"}", username, password, mspId);

        mockMvc.perform(post("/fabric/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string(jwtToken));
    }

    @Test
    @DisplayName("Admin login for Org2MSP")
    void testAdminLoginOrg2MSP() throws Exception {
        String username = "admin";
        String password = "adminpw";
        String mspId = "Org2MSP";
        String jwtToken = "mocked-jwt-token-org2";

        // Mock authentication
        Authentication mockAuth = Mockito.mock(Authentication.class);
        Mockito.when(authenticationManager.authenticate(any(CustomUsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        Mockito.when(mockAuth.isAuthenticated()).thenReturn(true);
        Mockito.when(jwtUtils.generateTokenFromUserDetails(eq(username), eq(mspId))).thenReturn(jwtToken);

        String requestBody = String.format("{\"username\":\"%s\",\"password\":\"%s\",\"mspId\":\"%s\"}", username, password, mspId);

        mockMvc.perform(post("/fabric/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(content().string(jwtToken));
    }

    @Test
    @DisplayName("Register doctor as Org1MSP admin and verify login")
    void testRegisterAndLoginDoctor() throws Exception {
        // Step 1: Admin logs in (Org1MSP)
        String adminUsername = "admin";
        String adminPassword = "adminpw";
        String adminMspId = "Org1MSP";
        String adminJwtToken = "mocked-admin-jwt-org1";

        Authentication mockAdminAuth = Mockito.mock(Authentication.class);
        Mockito.when(authenticationManager.authenticate(any(CustomUsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAdminAuth);
        Mockito.when(mockAdminAuth.isAuthenticated()).thenReturn(true);
        Mockito.when(jwtUtils.generateTokenFromUserDetails(eq(adminUsername), eq(adminMspId))).thenReturn(adminJwtToken);

        String adminLoginRequest = String.format("{\"username\":\"%s\",\"password\":\"%s\",\"mspId\":\"%s\"}", adminUsername, adminPassword, adminMspId);

        mockMvc.perform(post("/fabric/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(adminLoginRequest))
                .andExpect(status().isOk())
                .andExpect(content().string(adminJwtToken));

        // Step 2: Register doctor
        String doctorUsername = "doctor1";
        String doctorPassword = "doctorpw";
        String registerResult = "User registered successfully";

        // Ensure both userInfoService.addUser and fabricUserRegistration.addUser return true
        Mockito.when(userInfoService.addUser(any())).thenReturn(true);
        Mockito.when(fabricUserRegistration.addUser(any(), any(), any())).thenReturn(true);

        // Mock FabricService if used in registration flow
        Mockito.when(fabricService.submitTransaction(any(), any(), any(), any(), any(), any())).thenReturn("success");
        Mockito.when(fabricService.evaluateTransaction(any(), any(), any(), any(), any(), any())).thenReturn("success");

        mockMvc.perform(post("/fabric/register")
                .header("Authorization", "Bearer " + adminJwtToken)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .param("username", doctorUsername)
                .param("password", doctorPassword))
                .andExpect(status().isOk())
                .andExpect(content().string(registerResult));

        // Step 3: Doctor logs in
        String doctorJwt = "mocked-jwt-doctor1";
        Authentication mockDoctorAuth = Mockito.mock(Authentication.class);
        Mockito.when(authenticationManager.authenticate(any(CustomUsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockDoctorAuth);
        Mockito.when(mockDoctorAuth.isAuthenticated()).thenReturn(true);
        Mockito.when(jwtUtils.generateTokenFromUserDetails(eq(doctorUsername), eq(adminMspId))).thenReturn(doctorJwt);

        String doctorLoginRequest = String.format("{\"username\":\"%s\",\"password\":\"%s\",\"mspId\":\"%s\"}", doctorUsername, doctorPassword, adminMspId);

        MvcResult result = mockMvc.perform(post("/fabric/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(doctorLoginRequest))
                .andExpect(status().isOk())
                .andExpect(content().string(doctorJwt))
                .andReturn();

        // Store doctor JWT for further tests
        doctorJwtToken = result.getResponse().getContentAsString();
    }

    @Test
    @DisplayName("Register patient as Org2MSP admin and verify login")
    void testRegisterAndLoginPatient() throws Exception {
        // Step 1: Admin logs in (Org2MSP)
        String adminUsername = "admin";
        String adminPassword = "adminpw";
        String adminMspId = "Org2MSP";
        String adminJwtToken = "mocked-admin-jwt-org2";

        Authentication mockAdminAuth = Mockito.mock(Authentication.class);
        Mockito.when(authenticationManager.authenticate(any(CustomUsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAdminAuth);
        Mockito.when(mockAdminAuth.isAuthenticated()).thenReturn(true);
        Mockito.when(jwtUtils.generateTokenFromUserDetails(eq(adminUsername), eq(adminMspId))).thenReturn(adminJwtToken);

        String adminLoginRequest = String.format("{\"username\":\"%s\",\"password\":\"%s\",\"mspId\":\"%s\"}", adminUsername, adminPassword, adminMspId);

        mockMvc.perform(post("/fabric/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(adminLoginRequest))
                .andExpect(status().isOk())
                .andExpect(content().string(adminJwtToken));

        // Step 2: Register patient
        String patientUsername = "patient1";
        String patientPassword = "patientpw";
        String registerResult = "User registered successfully";

        Mockito.when(userInfoService.addUser(any())).thenReturn(true);
        Mockito.when(fabricUserRegistration.addUser(any(), any(), any())).thenReturn(true);
        Mockito.when(fabricService.submitTransaction(any(), any(), any(), any(), any(), any())).thenReturn("success");
        Mockito.when(fabricService.evaluateTransaction(any(), any(), any(), any(), any(), any())).thenReturn("success");

        mockMvc.perform(post("/fabric/register")
                .header("Authorization", "Bearer " + adminJwtToken)
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .param("username", patientUsername)
                .param("password", patientPassword))
                .andExpect(status().isOk())
                .andExpect(content().string(registerResult));

        // Step 3: Patient logs in
        String patientJwt = "mocked-jwt-patient1";
        Authentication mockPatientAuth = Mockito.mock(Authentication.class);
        Mockito.when(authenticationManager.authenticate(any(CustomUsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockPatientAuth);
        Mockito.when(mockPatientAuth.isAuthenticated()).thenReturn(true);
        Mockito.when(jwtUtils.generateTokenFromUserDetails(eq(patientUsername), eq(adminMspId))).thenReturn(patientJwt);

        String patientLoginRequest = String.format("{\"username\":\"%s\",\"password\":\"%s\",\"mspId\":\"%s\"}", patientUsername, patientPassword, adminMspId);

        MvcResult result = mockMvc.perform(post("/fabric/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(patientLoginRequest))
                .andExpect(status().isOk())
                .andExpect(content().string(patientJwt))
                .andReturn();

        // Store patient JWT for further tests
        patientJwtToken = result.getResponse().getContentAsString();
    }
}
